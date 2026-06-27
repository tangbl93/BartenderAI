import { request } from './client'
import type { BartenderApi } from './contract'
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
  PosterJob,
  PosterJobDto,
  Recipe,
  RecipeGenerateDto,
  RegisterDto,
  StyleTemplate,
  StyleTemplateDto,
  User,
  WallSort,
} from './types'

/** Real backend implementation, wired exactly to the OpenAPI paths. */
export const httpApi: BartenderApi = {
  health: () => request<Health>('/health', { auth: false }),
  locales: () => request<string[]>('/meta/locales', { auth: false }),

  register: (dto: RegisterDto) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: dto, auth: false }),
  login: (dto: LoginDto) =>
    request<AuthResult>('/auth/login', { method: 'POST', body: dto, auth: false }),
  adminLogin: (dto: LoginDto) =>
    request<AuthResult>('/auth/admin/login', { method: 'POST', body: dto, auth: false }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<User>('/auth/me'),

  getIngredients: (locale: string, category?: IngredientCategory) =>
    request<Ingredient[]>('/ingredients', { query: { locale, category }, auth: false }),
  adminListIngredients: () => request<Ingredient[]>('/admin/ingredients'),
  adminCreateIngredient: (dto: IngredientDto) =>
    request<Ingredient>('/admin/ingredients', { method: 'POST', body: dto }),
  adminUpdateIngredient: (id: string, dto: IngredientDto) =>
    request<Ingredient>(`/admin/ingredients/${id}`, { method: 'PUT', body: dto }),
  adminDeleteIngredient: (id: string) =>
    request<void>(`/admin/ingredients/${id}`, { method: 'DELETE' }),

  generateRecipe: (dto: RecipeGenerateDto) =>
    request<Recipe>('/recipes/generate', { method: 'POST', body: dto }),
  getRecipe: (id: string) => request<Recipe>(`/recipes/${id}`, { auth: false }),
  getExamples: (locale: string) =>
    request<Recipe[]>('/recipes/examples', { query: { locale }, auth: false }),

  createPosterJob: (dto: PosterJobDto) =>
    request<PosterJob>('/posters/jobs', { method: 'POST', body: dto }),
  getPosterJob: (id: string) => request<PosterJob>(`/posters/jobs/${id}`),
  retryPoster: (id: string) => request<void>(`/posters/${id}/retry`, { method: 'POST' }),

  getTemplates: () => request<StyleTemplate[]>('/templates', { auth: false }),
  adminListTemplates: () => request<StyleTemplate[]>('/admin/templates'),
  adminCreateTemplate: (dto: StyleTemplateDto) =>
    request<StyleTemplate>('/admin/templates', { method: 'POST', body: dto }),
  adminUpdateTemplate: (id: string, dto: StyleTemplateDto) =>
    request<StyleTemplate>(`/admin/templates/${id}`, { method: 'PUT', body: dto }),
  adminDeleteTemplate: (id: string) =>
    request<void>(`/admin/templates/${id}`, { method: 'DELETE' }),
  adminPreviewTemplate: (id: string) =>
    request<{ previewUrl: string }>(`/admin/templates/${id}/preview`, { method: 'POST' }),

  listLabEntries: () => request<LabEntry[]>('/lab/entries'),
  createLabEntry: (dto: LabEntryDto) =>
    request<LabEntry>('/lab/entries', { method: 'POST', body: dto }),
  getLabEntry: (id: string) => request<LabEntry>(`/lab/entries/${id}`),
  updateLabEntry: (id: string, dto: LabEntryDto) =>
    request<LabEntry>(`/lab/entries/${id}`, { method: 'PUT', body: dto }),
  deleteLabEntry: (id: string) => request<void>(`/lab/entries/${id}`, { method: 'DELETE' }),
  submitLabEntry: (id: string) =>
    request<void>(`/lab/entries/${id}/submit`, { method: 'POST' }),

  getWall: (sort: WallSort, page = 1) =>
    request<LabEntry[]>('/wall', { query: { sort, page }, auth: false }),
  moderationQueue: () => request<LabEntry[]>('/admin/moderation/queue'),
  moderate: (id: string, dto: ModerationDto) =>
    request<void>(`/admin/moderation/${id}`, { method: 'POST', body: dto }),

  dashboard: (from?: string, to?: string) =>
    request<Dashboard>('/admin/stats/dashboard', { query: { from, to } }),
}
