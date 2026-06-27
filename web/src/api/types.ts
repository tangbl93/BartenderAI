// Typed DTOs mirroring docs/api/openapi.yaml (single source of truth).

export type IngredientCategory = 'base_spirit' | 'drink' | 'fruit' | 'snack'
export type Role = 'user' | 'operator' | 'admin'
export type LocaleCode = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko'

export interface Health {
  status: string
  uptime: number
}

export interface ApiError {
  statusCode: number
  message: string
  code?: string
}

export interface RegisterDto {
  account: string
  password: string
  displayName?: string
}

export interface LoginDto {
  account: string
  password: string
}

export interface User {
  id: string
  account: string
  displayName?: string
  role: Role
}

export interface AuthResult {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface Ingredient {
  id: string
  category: IngredientCategory
  name: string
  enabled: boolean
}

/** Multi-language names keyed by locale. */
export type LocalizedNames = Partial<Record<LocaleCode, string>> & Record<string, string>

export interface IngredientDto {
  category: IngredientCategory
  names: LocalizedNames
  enabled?: boolean
}

export interface RecipeGenerateDto {
  ingredientIds: string[]
  locale: string
}

export interface RecipeItem {
  ingredientId: string
  name: string
  amount: string
  optional?: boolean
}

export interface ToolSubstitution {
  tool: string
  homeAlternative: string
}

export interface Recipe {
  id: string
  name: string
  tagline: string
  locale: string
  items: RecipeItem[]
  steps: string[]
  toolSubstitutions: ToolSubstitution[]
  alcoholRange: string
  safetyNotes: string[]
  isExample?: boolean
}

export type PosterDimension = 'home_closeup' | 'bar_commercial' | 'steps_long'
export type PosterStatus = 'pending' | 'running' | 'done' | 'failed'
export type PosterJobStatus = 'pending' | 'running' | 'partial' | 'done' | 'failed'

export interface Poster {
  id: string
  dimension: PosterDimension
  templateId?: string
  status: PosterStatus
  imageUrl?: string
  textSnapshot?: Record<string, unknown>
}

export interface PosterJob {
  id: string
  recipeId: string
  status: PosterJobStatus
  posters: Poster[]
}

export interface PosterJobDto {
  recipeId: string
  templateIds?: string[]
  locale?: string
}

export type TemplateDimension = 'home_closeup' | 'bar_commercial' | 'steps_long' | 'custom'
export type TextAlign = 'left' | 'center' | 'right'
export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
export type TextRenderMode = 'model' | 'backend'

export interface LayoutConfig {
  textAlign?: TextAlign
  watermarkPosition?: WatermarkPosition
}

export interface StyleTemplate {
  id: string
  name: string
  dimension: TemplateDimension
  prompt: string
  layout?: LayoutConfig
  textRenderMode?: TextRenderMode
  enabled: boolean
  version: number
}

export interface StyleTemplateDto {
  name: string
  dimension: TemplateDimension
  prompt: string
  layout?: LayoutConfig
  textRenderMode?: TextRenderMode
  enabled?: boolean
}

export type LabResult = 'success' | 'fail'
export type ModerationStatus = 'private' | 'pending' | 'approved' | 'rejected'

export interface LabEntry {
  id: string
  recipeId: string
  imageUrl: string
  result: LabResult
  note?: string
  isPublic?: boolean
  moderationStatus?: ModerationStatus
  createdAt: string
  // Convenience fields the mock attaches for the wall/list UI (optional, non-contract).
  recipeName?: string
  likes?: number
}

export interface LabEntryDto {
  recipeId: string
  imageUrl: string
  result: LabResult
  note?: string
}

export type ModerationDecision = 'approve' | 'reject'

export interface ModerationDto {
  decision: ModerationDecision
  reason?: string
}

export interface RankItem {
  name: string
  count: number
}

export interface Dashboard {
  recipeCount: number
  posterCount: number
  submissionCount: number
  approvalRate: number
  topIngredients: RankItem[]
  topStyles: RankItem[]
}

export type WallSort = 'hot' | 'time'
