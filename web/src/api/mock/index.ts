import { HttpError } from '../client'
import type { BartenderApi } from '../contract'
import type {
  AuthResult,
  Dashboard,
  Health,
  Ingredient,
  IngredientCategory,
  IngredientDto,
  LabEntry,
  LabEntryDto,
  LoginDto,
  ModerationDto,
  Poster,
  PosterDimension,
  PosterJob,
  PosterJobDto,
  Recipe,
  RecipeGenerateDto,
  RegisterDto,
  StyleTemplate,
  StyleTemplateDto,
  User,
  WallSort,
} from '../types'
import {
  exampleRecipes,
  ingredientSeed,
  ingredientView,
  posterPlaceholder,
  resolveLocale,
  templateSeed,
  type IngredientSeed,
} from './data'

let seq = 1000
const uid = (p: string) => `${p}-${++seq}`
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

// ---- in-memory state ----
const ingredients: IngredientSeed[] = ingredientSeed.map((i) => ({ ...i, names: { ...i.names } }))
const templates: StyleTemplate[] = templateSeed.map((t) => ({ ...t }))
const recipes = new Map<string, Recipe>()
const posterJobs = new Map<string, PosterJob>()
const labEntries: LabEntry[] = []

interface MockUser extends User {
  password: string
}
const users: MockUser[] = [
  { id: 'u-demo', account: 'demo@bar.ai', displayName: 'Demo Drinker', role: 'user', password: 'password' },
  { id: 'a-admin', account: 'admin@bar.ai', displayName: 'Admin', role: 'admin', password: 'admin123' },
  { id: 'a-op', account: 'operator@bar.ai', displayName: 'Operator', role: 'operator', password: 'operator123' },
]
let currentUser: MockUser | null = null

function token(u: MockUser) {
  return `mock.${u.id}.${Date.now()}`
}

function requireAuth(): MockUser {
  if (!currentUser) throw new HttpError(401, 'Not authenticated')
  return currentUser
}

function makeRecipe(ingredientIds: string[], locale: string): Recipe {
  const L = (m: Record<string, string>) => resolveLocale(m, locale)
  const chosen = ingredientIds
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is IngredientSeed => !!i)
  const hasSpirit = chosen.some((c) => c.category === 'base_spirit')
  const id = uid('recipe')
  const recipe: Recipe = {
    id,
    locale,
    name: L({ en: 'Blind-Box Special', 'zh-CN': '盲盒特调', 'zh-TW': '盲盒特調', ja: 'ブラインドボックス・スペシャル', ko: '블라인드 박스 스페셜' }),
    tagline: L({ en: 'Mixed from whatever your fridge offered tonight.', 'zh-CN': '用今晚冰箱里的一切，调出专属惊喜。', 'zh-TW': '用今晚冰箱裡的一切，調出專屬驚喜。', ja: '今夜の冷蔵庫から生まれた特別な一杯。', ko: '오늘 밤 냉장고가 준 모든 것으로 만든 한 잔.' }),
    alcoholRange: hasSpirit ? '8-12% ABV' : '0% (mocktail)',
    items: chosen.map((c, idx) => ({
      ingredientId: c.id,
      name: resolveLocale(c.names, locale),
      amount: c.category === 'base_spirit' ? '45 ml' : idx === 0 ? '90 ml' : '30 ml',
      optional: c.category === 'snack',
    })),
    steps: [
      L({ en: 'Prepare a chilled glass with ice.', 'zh-CN': '准备一个加冰的冰镇杯子。', 'zh-TW': '準備一個加冰的冰鎮杯子。', ja: '氷を入れた冷えたグラスを用意する。', ko: '얼음을 넣은 차가운 잔을 준비한다.' }),
      L({ en: 'Add the spirits, then the mixers.', 'zh-CN': '先加基酒，再加调和饮料。', 'zh-TW': '先加基酒，再加調和飲料。', ja: 'ベースのお酒、次に割り材を加える。', ko: '베이스 술을 넣고 음료를 더한다.' }),
      L({ en: 'Stir gently and garnish to taste.', 'zh-CN': '轻轻搅拌，按口味装饰。', 'zh-TW': '輕輕攪拌，按口味裝飾。', ja: '軽く混ぜ、お好みで飾る。', ko: '부드럽게 저은 뒤 취향껏 장식한다.' }),
    ],
    toolSubstitutions: [
      { tool: L({ en: 'Jigger', 'zh-CN': '量酒器', 'zh-TW': '量酒器', ja: 'ジガー', ko: '지거' }), homeAlternative: L({ en: '1 jigger ≈ 1.5 tablespoons', 'zh-CN': '1 量酒器 ≈ 1.5 汤匙', 'zh-TW': '1 量酒器 ≈ 1.5 湯匙', ja: '1ジガー ≈ 大さじ1.5', ko: '지거 1개 ≈ 1.5 큰술' }) },
    ],
    safetyNotes: [
      L({ en: 'Please drink responsibly. No alcohol for minors.', 'zh-CN': '请适量饮用，未成年人禁止饮酒。', 'zh-TW': '請適量飲用，未成年人禁止飲酒。', ja: '適量をお楽しみください。未成年者の飲酒は禁止です。', ko: '적당히 즐기세요. 미성년자 음주 금지.' }),
    ],
  }
  recipes.set(id, recipe)
  return recipe
}

const DEFAULT_DIMENSIONS: PosterDimension[] = ['home_closeup', 'bar_commercial', 'steps_long']

function startPosterJob(job: PosterJob) {
  // Simulate parallel async generation: each poster resolves (or one fails) over time.
  job.posters.forEach((poster, idx) => {
    setTimeout(() => {
      const j = posterJobs.get(job.id)
      if (!j) return
      const p = j.posters.find((x) => x.id === poster.id)
      if (!p || p.status === 'done') return
      // Make the 2nd poster fail once to exercise the retry UI.
      if (idx === 1 && !(p.textSnapshot?.retried)) {
        p.status = 'failed'
      } else {
        p.status = 'done'
        p.imageUrl = posterPlaceholder(p.dimension, dimColor(p.dimension))
      }
      recomputeJobStatus(j)
    }, 600 + idx * 700)
  })
}

function dimColor(d: PosterDimension): string {
  return d === 'home_closeup' ? '#c08457' : d === 'bar_commercial' ? '#1b1b2f' : '#2e7d6f'
}

function recomputeJobStatus(job: PosterJob) {
  const statuses = job.posters.map((p) => p.status)
  if (statuses.every((s) => s === 'done')) job.status = 'done'
  else if (statuses.some((s) => s === 'failed') && statuses.some((s) => s === 'done')) job.status = 'partial'
  else if (statuses.every((s) => s === 'failed')) job.status = 'failed'
  else job.status = 'running'
}

export const mockApi: BartenderApi = {
  async health(): Promise<Health> {
    await delay(50)
    return { status: 'ok', uptime: 123 }
  },
  async locales() {
    await delay(50)
    return ['en', 'zh-CN', 'zh-TW', 'ja', 'ko']
  },

  async register(dto: RegisterDto): Promise<AuthResult> {
    await delay()
    if (users.some((u) => u.account === dto.account)) {
      throw new HttpError(409, 'Account already exists', 'ACCOUNT_EXISTS')
    }
    const u: MockUser = {
      id: uid('u'),
      account: dto.account,
      displayName: dto.displayName || dto.account.split('@')[0],
      role: 'user',
      password: dto.password,
    }
    users.push(u)
    currentUser = u
    return { accessToken: token(u), refreshToken: token(u), user: stripPw(u) }
  },
  async login(dto: LoginDto): Promise<AuthResult> {
    await delay()
    const u = users.find((x) => x.account === dto.account && x.password === dto.password && x.role === 'user')
    if (!u) throw new HttpError(401, 'Invalid credentials')
    currentUser = u
    return { accessToken: token(u), refreshToken: token(u), user: stripPw(u) }
  },
  async adminLogin(dto: LoginDto): Promise<AuthResult> {
    await delay()
    const u = users.find(
      (x) => x.account === dto.account && x.password === dto.password && (x.role === 'admin' || x.role === 'operator'),
    )
    if (!u) throw new HttpError(401, 'Invalid credentials')
    currentUser = u
    return { accessToken: token(u), refreshToken: token(u), user: stripPw(u) }
  },
  async logout() {
    await delay(50)
    currentUser = null
  },
  async me(): Promise<User> {
    await delay(50)
    return stripPw(requireAuth())
  },

  async getIngredients(locale: string, category?: IngredientCategory): Promise<Ingredient[]> {
    await delay(120)
    return ingredients
      .filter((i) => i.enabled && (!category || i.category === category))
      .map((i) => ingredientView(i, locale))
  },
  async adminListIngredients(): Promise<Ingredient[]> {
    await delay(120)
    requireAuth()
    return ingredients.map((i) => ingredientView(i, 'en'))
  },
  async adminCreateIngredient(dto: IngredientDto): Promise<Ingredient> {
    await delay()
    requireAuth()
    if (!['base_spirit', 'drink', 'fruit', 'snack'].includes(dto.category)) {
      throw new HttpError(400, 'Invalid category')
    }
    const seed: IngredientSeed = {
      id: uid('ing'),
      category: dto.category,
      names: { en: '', 'zh-CN': '', 'zh-TW': '', ja: '', ko: '', ...dto.names } as IngredientSeed['names'],
      enabled: dto.enabled ?? true,
    }
    ingredients.push(seed)
    return ingredientView(seed, 'en')
  },
  async adminUpdateIngredient(id: string, dto: IngredientDto): Promise<Ingredient> {
    await delay()
    requireAuth()
    const seed = ingredients.find((i) => i.id === id)
    if (!seed) throw new HttpError(404, 'Not found')
    seed.category = dto.category
    seed.names = { ...seed.names, ...dto.names }
    seed.enabled = dto.enabled ?? seed.enabled
    return ingredientView(seed, 'en')
  },
  async adminDeleteIngredient(id: string): Promise<void> {
    await delay()
    requireAuth()
    const seed = ingredients.find((i) => i.id === id)
    if (seed) seed.enabled = false // disable instead of hard delete (protects history)
  },

  async generateRecipe(dto: RecipeGenerateDto): Promise<Recipe> {
    await delay(600)
    if (!dto.ingredientIds || dto.ingredientIds.length < 2) {
      throw new HttpError(422, 'Please select at least 2 ingredients', 'NOT_ENOUGH_INGREDIENTS')
    }
    return makeRecipe(dto.ingredientIds, dto.locale)
  },
  async getRecipe(id: string): Promise<Recipe> {
    await delay(120)
    const r = recipes.get(id) || exampleRecipes('en').find((e) => e.id === id)
    if (!r) throw new HttpError(404, 'Recipe not found')
    return r
  },
  async getExamples(locale: string): Promise<Recipe[]> {
    await delay(120)
    const list = exampleRecipes(locale)
    list.forEach((r) => recipes.set(r.id, r))
    return list
  },

  async createPosterJob(dto: PosterJobDto): Promise<PosterJob> {
    await delay(200)
    requireAuth()
    const templateIds = dto.templateIds?.length
      ? dto.templateIds
      : ['tpl-home-closeup', 'tpl-bar-commercial', 'tpl-steps-long']
    const posters: Poster[] = templateIds.map((tid, i) => {
      const tpl = templates.find((t) => t.id === tid)
      const dimension = (tpl?.dimension && tpl.dimension !== 'custom'
        ? tpl.dimension
        : DEFAULT_DIMENSIONS[i % DEFAULT_DIMENSIONS.length]) as PosterDimension
      return {
        id: uid('poster'),
        dimension,
        templateId: tid,
        status: 'running',
        textSnapshot: {},
      }
    })
    const job: PosterJob = { id: uid('job'), recipeId: dto.recipeId, status: 'running', posters }
    posterJobs.set(job.id, job)
    startPosterJob(job)
    return JSON.parse(JSON.stringify(job))
  },
  async getPosterJob(id: string): Promise<PosterJob> {
    await delay(120)
    const job = posterJobs.get(id)
    if (!job) throw new HttpError(404, 'Job not found')
    return JSON.parse(JSON.stringify(job))
  },
  async retryPoster(id: string): Promise<void> {
    await delay(200)
    for (const job of posterJobs.values()) {
      const p = job.posters.find((x) => x.id === id)
      if (p) {
        p.status = 'running'
        p.textSnapshot = { ...(p.textSnapshot || {}), retried: true }
        recomputeJobStatus(job)
        setTimeout(() => {
          p.status = 'done'
          p.imageUrl = posterPlaceholder(p.dimension, dimColor(p.dimension))
          recomputeJobStatus(job)
        }, 800)
        return
      }
    }
    throw new HttpError(404, 'Poster not found')
  },

  async getTemplates(): Promise<StyleTemplate[]> {
    await delay(100)
    return templates.filter((t) => t.enabled).map((t) => ({ ...t }))
  },
  async adminListTemplates(): Promise<StyleTemplate[]> {
    await delay(100)
    requireAuth()
    return templates.map((t) => ({ ...t }))
  },
  async adminCreateTemplate(dto: StyleTemplateDto): Promise<StyleTemplate> {
    await delay()
    requireAuth()
    const tpl: StyleTemplate = {
      id: uid('tpl'),
      name: dto.name,
      dimension: dto.dimension,
      prompt: dto.prompt,
      layout: dto.layout || { textAlign: 'center', watermarkPosition: 'bottom-right' },
      textRenderMode: dto.textRenderMode || 'backend',
      enabled: dto.enabled ?? true,
      version: 1,
    }
    templates.push(tpl)
    return { ...tpl }
  },
  async adminUpdateTemplate(id: string, dto: StyleTemplateDto): Promise<StyleTemplate> {
    await delay()
    requireAuth()
    const tpl = templates.find((t) => t.id === id)
    if (!tpl) throw new HttpError(404, 'Not found')
    Object.assign(tpl, {
      name: dto.name,
      dimension: dto.dimension,
      prompt: dto.prompt,
      layout: dto.layout ?? tpl.layout,
      textRenderMode: dto.textRenderMode ?? tpl.textRenderMode,
      enabled: dto.enabled ?? tpl.enabled,
      version: tpl.version + 1, // bump version: changes only affect new posters
    })
    return { ...tpl }
  },
  async adminDeleteTemplate(id: string): Promise<void> {
    await delay()
    requireAuth()
    const tpl = templates.find((t) => t.id === id)
    if (tpl) tpl.enabled = false
  },
  async adminPreviewTemplate(id: string): Promise<{ previewUrl: string }> {
    await delay(300)
    requireAuth()
    const tpl = templates.find((t) => t.id === id)
    return { previewUrl: posterPlaceholder(tpl?.name || 'Preview', '#444') }
  },

  async listLabEntries(): Promise<LabEntry[]> {
    await delay(120)
    const u = requireAuth()
    return labEntries
      .filter((e) => (e as LabEntry & { ownerId?: string })['ownerId'] === u.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async createLabEntry(dto: LabEntryDto): Promise<LabEntry> {
    await delay()
    const u = requireAuth()
    if (!dto.recipeId || !dto.imageUrl || !dto.result) {
      throw new HttpError(400, 'Missing required fields')
    }
    const recipe = recipes.get(dto.recipeId)
    const entry: LabEntry & { ownerId: string } = {
      id: uid('lab'),
      recipeId: dto.recipeId,
      imageUrl: dto.imageUrl,
      result: dto.result,
      note: dto.note,
      isPublic: false,
      moderationStatus: 'private',
      createdAt: new Date().toISOString(),
      recipeName: recipe?.name,
      likes: 0,
      ownerId: u.id,
    }
    labEntries.unshift(entry)
    return entry
  },
  async getLabEntry(id: string): Promise<LabEntry> {
    await delay(80)
    const u = requireAuth()
    const e = labEntries.find((x) => x.id === id) as (LabEntry & { ownerId?: string }) | undefined
    if (!e) throw new HttpError(404, 'Not found')
    if (e.ownerId !== u.id && e.moderationStatus !== 'approved') throw new HttpError(403, 'Forbidden')
    return e
  },
  async updateLabEntry(id: string, dto: LabEntryDto): Promise<LabEntry> {
    await delay()
    const u = requireAuth()
    const e = labEntries.find((x) => x.id === id) as (LabEntry & { ownerId?: string }) | undefined
    if (!e) throw new HttpError(404, 'Not found')
    if (e.ownerId !== u.id) throw new HttpError(403, 'Forbidden')
    e.imageUrl = dto.imageUrl
    e.result = dto.result
    e.note = dto.note
    e.recipeId = dto.recipeId
    return e
  },
  async deleteLabEntry(id: string): Promise<void> {
    await delay()
    const u = requireAuth()
    const idx = labEntries.findIndex((x) => x.id === id)
    if (idx < 0) return
    const e = labEntries[idx] as LabEntry & { ownerId?: string }
    if (e.ownerId !== u.id) throw new HttpError(403, 'Forbidden')
    labEntries.splice(idx, 1)
  },
  async submitLabEntry(id: string): Promise<void> {
    await delay()
    const u = requireAuth()
    const e = labEntries.find((x) => x.id === id) as (LabEntry & { ownerId?: string }) | undefined
    if (!e) throw new HttpError(404, 'Not found')
    if (e.ownerId !== u.id) throw new HttpError(403, 'Forbidden')
    e.isPublic = true
    e.moderationStatus = 'pending'
  },

  async getWall(sort: WallSort): Promise<LabEntry[]> {
    await delay(120)
    const approved = labEntries.filter((e) => e.moderationStatus === 'approved')
    const sorted = [...approved].sort((a, b) =>
      sort === 'hot' ? (b.likes || 0) - (a.likes || 0) : b.createdAt.localeCompare(a.createdAt),
    )
    return sorted
  },
  async moderationQueue(): Promise<LabEntry[]> {
    await delay(120)
    requireAuth()
    return labEntries.filter((e) => e.moderationStatus === 'pending')
  },
  async moderate(id: string, dto: ModerationDto): Promise<void> {
    await delay()
    requireAuth()
    if (dto.decision === 'reject' && !dto.reason) {
      throw new HttpError(400, 'Reject reason is required')
    }
    const e = labEntries.find((x) => x.id === id)
    if (!e) throw new HttpError(404, 'Not found')
    e.moderationStatus = dto.decision === 'approve' ? 'approved' : 'rejected'
  },

  async dashboard(): Promise<Dashboard> {
    await delay(150)
    requireAuth()
    const submissions = labEntries.length
    const approved = labEntries.filter((e) => e.moderationStatus === 'approved').length
    return {
      recipeCount: recipes.size + 42,
      posterCount: posterJobs.size * 3 + 88,
      submissionCount: submissions + 17,
      approvalRate: submissions ? Math.round((approved / submissions) * 100) / 100 : 0.76,
      topIngredients: [
        { name: 'Vodka', count: 120 },
        { name: 'Lime', count: 98 },
        { name: 'Soda Water', count: 76 },
        { name: 'Mint', count: 64 },
        { name: 'Orange Juice', count: 51 },
      ],
      topStyles: [
        { name: 'Bar Commercial Poster', count: 140 },
        { name: 'Home Micro-Brew Close-up', count: 110 },
        { name: 'Step-by-step Long Image', count: 72 },
      ],
    }
  },
}

function stripPw(u: MockUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u
  return rest
}
