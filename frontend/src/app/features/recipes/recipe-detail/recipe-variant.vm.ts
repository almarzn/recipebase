import { computed, effect, Injectable, inject, untracked } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { distinctUntilChanged, map } from "rxjs/operators";
import type { Variant } from "@/shared/models";
import { externalSignal } from "@/shared/utils/external-signal";
import { RecipeDetailViewModel } from "./recipe-detail.vm";

@Injectable()
export class RecipeVariantViewModel {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly parentVm = inject(RecipeDetailViewModel);

  readonly variantSlug = externalSignal<string | null>(
    () => this.route.snapshot.paramMap.get("variantSlug"),
    (value) => {
      const recipeSlug = this.parentVm.slug();
      if (recipeSlug && value) {
        void this.router.navigate(["/recipes", recipeSlug, value]);
      }
    },
    this.route.paramMap.pipe(
      map((p) => p.get("variantSlug")),
      distinctUntilChanged(),
    ),
  );

  readonly activeVariant = computed<Variant | null>(() => {
    const variants = this.parentVm.variants();
    const slug = this.variantSlug();
    if (variants.length === 0) return null;
    if (!slug) return variants[0];
    return variants.find((v) => v.slug === slug) ?? variants[0];
  });

  constructor() {
    effect(() => {
      const recipe = this.parentVm.recipe();
      if (recipe) {
        const variantSlug = untracked(() => this.variantSlug());

        if (!variantSlug) {
          const variants = recipe.variants;
          if (variants.length > 0) {
            this.variantSlug.set(variants[0].slug);
          }
        }
      }
    });
  }
}

export const provideRecipeVariantViewModel = () => ({
  provide: RecipeVariantViewModel,
  useClass: RecipeVariantViewModel,
});
