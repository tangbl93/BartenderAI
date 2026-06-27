import { Locale } from '../common/constants';

export interface TextProviderIngredient {
  id: string;
  category: string;
  /** Resolved display name in the target locale. */
  name: string;
}

export interface TextGenerationRequest {
  ingredients: TextProviderIngredient[];
  locale: Locale;
}

export interface GeneratedRecipeItem {
  ingredientId: string;
  name: string;
  amount: string;
  optional: boolean;
}

export interface GeneratedToolSubstitution {
  tool: string;
  homeAlternative: string;
}

/** Structured recipe JSON returned by any text provider. */
export interface GeneratedRecipe {
  name: string;
  tagline: string;
  items: GeneratedRecipeItem[];
  steps: string[];
  toolSubstitutions: GeneratedToolSubstitution[];
  alcoholRange: string;
  safetyNotes: string[];
}

export interface TextProvider {
  generateRecipe(req: TextGenerationRequest): Promise<GeneratedRecipe>;
}

export const TEXT_PROVIDER = Symbol('TEXT_PROVIDER');
