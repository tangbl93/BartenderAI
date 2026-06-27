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

/**
 * The single API surface used by the whole app. Both the real HTTP client and
 * the dev mock adapter implement this interface, so the UI is identical either way.
 */
export interface BartenderApi {
  // meta
  health(): Promise<Health>
  locales(): Promise<string[]>

  // auth
  register(dto: RegisterDto): Promise<AuthResult>
  login(dto: LoginDto): Promise<AuthResult>
  adminLogin(dto: LoginDto): Promise<AuthResult>
  logout(): Promise<void>
  me(): Promise<User>

  // ingredients
  getIngredients(locale: string, category?: IngredientCategory): Promise<Ingredient[]>
  adminListIngredients(): Promise<Ingredient[]>
  adminCreateIngredient(dto: IngredientDto): Promise<Ingredient>
  adminUpdateIngredient(id: string, dto: IngredientDto): Promise<Ingredient>
  adminDeleteIngredient(id: string): Promise<void>

  // recipes
  generateRecipe(dto: RecipeGenerateDto): Promise<Recipe>
  getRecipe(id: string): Promise<Recipe>
  getExamples(locale: string): Promise<Recipe[]>

  // posters
  createPosterJob(dto: PosterJobDto): Promise<PosterJob>
  getPosterJob(id: string): Promise<PosterJob>
  retryPoster(id: string): Promise<void>

  // templates
  getTemplates(): Promise<StyleTemplate[]>
  adminListTemplates(): Promise<StyleTemplate[]>
  adminCreateTemplate(dto: StyleTemplateDto): Promise<StyleTemplate>
  adminUpdateTemplate(id: string, dto: StyleTemplateDto): Promise<StyleTemplate>
  adminDeleteTemplate(id: string): Promise<void>
  adminPreviewTemplate(id: string): Promise<{ previewUrl: string }>

  // lab
  listLabEntries(): Promise<LabEntry[]>
  createLabEntry(dto: LabEntryDto): Promise<LabEntry>
  getLabEntry(id: string): Promise<LabEntry>
  updateLabEntry(id: string, dto: LabEntryDto): Promise<LabEntry>
  deleteLabEntry(id: string): Promise<void>
  submitLabEntry(id: string): Promise<void>

  // wall & moderation
  getWall(sort: WallSort, page?: number): Promise<LabEntry[]>
  moderationQueue(): Promise<LabEntry[]>
  moderate(id: string, dto: ModerationDto): Promise<void>

  // stats
  dashboard(from?: string, to?: string): Promise<Dashboard>
}
