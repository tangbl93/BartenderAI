// Shared API types matching the NestJS backend (docs/api/openapi.yaml)

export type IngredientCategory = 'base_spirit' | 'drink' | 'fruit' | 'snack'
export type Role = 'user' | 'operator' | 'admin'
export type TextRenderMode = 'model' | 'backend'
export type TemplateDimension =
  | 'home_closeup'
  | 'bar_commercial'
  | 'steps_long'
  | 'custom'
export type TextAlign = 'left' | 'center' | 'right'
export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

export interface LocaleNames {
  en?: string
  'zh-CN'?: string
  'zh-TW'?: string
  ja?: string
  ko?: string
}

export interface Ingredient {
  id: string
  category: IngredientCategory
  name: string
  names: LocaleNames
  enabled: boolean
  /** Flat-illustration artwork URL (generated async; null until ready). */
  imageUrl?: string | null
}

export interface LayoutConfig {
  textAlign?: TextAlign
  watermarkPosition?: WatermarkPosition
}

export interface StyleTemplate {
  id: string
  name: string
  dimension: TemplateDimension
  prompt: string
  layout: LayoutConfig
  textRenderMode: TextRenderMode
  enabled: boolean
  version: number
  referenceImageUrl?: string | null
}

export interface AdminUser {
  id: string
  account: string
  deviceId?: string | null
  isDevice: boolean
  displayName?: string | null
  role: Role
  createdAt: string
}

export interface UserPage {
  items: AdminUser[]
  total: number
  page: number
  size: number
}

export interface UserCounts {
  labEntries: number
  recipes: number
  posters: number
}

export interface AdminUserDetail {
  user: AdminUser
  counts: UserCounts
}

export interface LabEntry {
  id: string
  recipeId?: string
  imageUrl?: string
  result?: 'success' | 'fail'
  note?: string
  isPublic?: boolean
  moderationStatus?: 'private' | 'pending' | 'approved' | 'rejected'
  status?: string
  createdAt: string
  title?: string
}

export interface ResultItem {
  type: 'recipe' | 'poster'
  id: string
  ownerId: string
  createdAt: string
  title: string
  imageUrl?: string | null
}

export interface ResultsPage {
  items: ResultItem[]
  total: number
  page: number
  size: number
}

export interface TopCountItem {
  name: string
  count: number
}

export interface DashboardStats {
  recipeCount: number
  posterCount: number
  submissionCount: number
  approvalRate: number
  topIngredients: TopCountItem[]
  topStyles: TopCountItem[]
}
