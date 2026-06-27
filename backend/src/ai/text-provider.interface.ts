import { Locale } from '../common/constants';

export interface TextProviderIngredient {
  id: string;
  category: string;
  /** Resolved display name in the target locale. */
  name: string;
  /** Authoritative en name (used by the stub recognizer). Optional for real
   *  AI providers; populated by RecipesService from the ingredient's `names`. */
  enName?: string;
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

/** Structured recipe JSON returned by the stub recipe generator. */
export interface GeneratedRecipe {
  name: string;
  tagline: string;
  items: GeneratedRecipeItem[];
  steps: string[];
  toolSubstitutions: GeneratedToolSubstitution[];
  alcoholRange: string;
  safetyNotes: string[];
}
