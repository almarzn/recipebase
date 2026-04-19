import { type HttpErrorResponse, httpResource } from "@angular/common/http";
import { computed, Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { filter, map } from "rxjs/operators";
import type { Component, Recipe } from "@/shared/models";

export type ErrorState = { kind: "error"; message: string } | { kind: "notFound" };

@Injectable()
export class RecipeDetailViewModel {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get("slug")),
      filter((s): s is string => s !== null),
    ),
  );

  readonly recipe = httpResource<Recipe>(() => `/api/recipes/${this.slug()}`);

  readonly components = computed<Component[]>(() => this.recipe.value()?.components ?? []);

  readonly loading = this.recipe.isLoading;

  readonly errorState = computed((): ErrorState | null => {
    const err = this.recipe.error() as HttpErrorResponse | null | undefined;
    if (err == null) return null;

    if (err.status === 404) {
      return { kind: "notFound" };
    }

    return {
      kind: "error",
      message: err.error?.message || err.message || "Failed to load recipe",
    };
  });

  reload(): void {
    this.recipe.reload();
  }
}

export const provideRecipeDetailViewModel = () => ({
  provide: RecipeDetailViewModel,
  useClass: RecipeDetailViewModel,
});
