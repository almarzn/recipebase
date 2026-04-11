import { type HttpErrorResponse, httpResource } from "@angular/common/http";
import { computed, Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { filter, map } from "rxjs/operators";
import type { Recipe } from "@/shared/models";

export type ErrorState = { kind: "error"; message: string } | { kind: "notFound" };

@Injectable()
export class RecipeDetailViewModel {
  private readonly route = inject(ActivatedRoute);

  readonly slug = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get("slug")),
      filter((s): s is string => s !== null),
    ),
  );

  private readonly recipeResource = httpResource<Recipe>(() => `/api/recipes/${this.slug()}`);

  readonly recipe = computed(() => (this.recipeResource.hasValue() ? this.recipeResource.value() : null));
  readonly loading = this.recipeResource.isLoading;
  readonly errorState = computed((): ErrorState | null => {
    const err = this.recipeResource.error() as HttpErrorResponse | undefined;
    if (!err) return null;

    // 404 is "not found", not an error
    if (err.status === 404) {
      return { kind: "notFound" };
    }

    // Other HTTP errors show error message
    return {
      kind: "error",
      message: err.error?.message || err.message || "Failed to load recipe",
    };
  });

  readonly title = computed(() => this.recipe()?.title ?? "");
  readonly variants = computed(() => this.recipe()?.variants ?? []);
}

export const provideRecipeDetailViewModel = () => ({
  provide: RecipeDetailViewModel,
  useClass: RecipeDetailViewModel,
});
