import { computed, inject, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RecipeSummary } from '@/shared/models';

@Injectable()
export class RecipeListViewModel {
  private readonly recipesResource = httpResource<RecipeSummary[]>(() => '/api/recipes');

  readonly recipes = computed(() => this.recipesResource.value() ?? []);
  readonly loading = this.recipesResource.isLoading;
  readonly error = computed(() => this.recipesResource.error()?.message ?? null);

  readonly hasRecipes = computed(() => this.recipes().length > 0);
  readonly recipeCount = computed(() => this.recipes().length);
}
