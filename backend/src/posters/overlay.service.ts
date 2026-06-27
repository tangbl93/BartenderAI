import { Injectable } from '@nestjs/common';
import { RecipeEntity } from '../database/entities';
import { TemplateSnapshot } from '../database/entities/poster.entity';

export interface PosterTextSnapshot {
  name: string;
  tagline: string;
  keyIngredients: string[];
  alcoholRange: string;
  signature: string;
  recipeLabel: string;
  watermark: string;
  textAlign: string;
  watermarkPosition: string;
  /** Whether text is drawn by the backend overlay (backend) or the model. */
  renderMode: string;
}

/**
 * Backend text/watermark overlay service.
 *
 * Builds the text snapshot for a poster strictly from the recipe (so poster
 * text always matches the recipe) and "renders" the overlay. In this
 * environment we cannot run a real headless canvas, so the overlay is a clearly
 * stubbed compositor: when textRenderMode=backend it records the text layers +
 * watermark that would be composited onto the base image and returns a
 * deterministic composited URL. When textRenderMode=model the text is left to
 * the image model and we only attach the snapshot for verification.
 */
@Injectable()
export class OverlayService {
  /** Build the text snapshot from the recipe content. */
  buildTextSnapshot(
    recipe: RecipeEntity,
    snapshot: TemplateSnapshot,
  ): PosterTextSnapshot {
    const keyIngredients = (recipe.items || [])
      .filter((i) => !i.optional)
      .map((i) => i.name)
      .slice(0, 4);

    return {
      name: recipe.name,
      tagline: recipe.tagline,
      keyIngredients,
      alcoholRange: recipe.alcoholRange,
      // Bar-commercial preset elements (signature, exclusive recipe label).
      signature: 'Mixed by Home Bartender AI',
      recipeLabel: 'Exclusive Recipe',
      watermark: 'Home Bartender AI',
      textAlign: snapshot.layout?.textAlign || 'center',
      watermarkPosition: snapshot.layout?.watermarkPosition || 'bottom-right',
      renderMode: snapshot.textRenderMode,
    };
  }

  /**
   * Composite the backend text/watermark onto the base image.
   * Stubbed: returns the base image URL annotated with overlay params so the
   * pipeline is deterministic and testable. A real implementation would draw
   * onto a canvas and upload the result.
   */
  composite(baseImageUrl: string, text: PosterTextSnapshot): string {
    if (text.renderMode !== 'backend') {
      // Model renders the art text; nothing to composite.
      return baseImageUrl;
    }
    const params = new URLSearchParams({
      title: text.name,
      align: text.textAlign,
      wm: text.watermarkPosition,
    });
    const sep = baseImageUrl.includes('?') ? '&' : '?';
    return `${baseImageUrl}${sep}overlay=1&${params.toString()}`;
  }
}
