import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";

import { provideRecipeDetailViewModel, RecipeDetailViewModel } from "./recipe-detail.vm";
import { RecipeHeaderComponent } from "./recipe-header.component";
import { RecipeIngredientListComponent } from "./recipe-ingredient-list.component";
import { RecipeStepsComponent } from "./recipe-steps.component";
import { provideRecipeVariantViewModel, RecipeVariantViewModel } from "./recipe-variant.vm";

@Component({
  selector: "app-recipe-detail",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeHeaderComponent, RecipeIngredientListComponent, RecipeStepsComponent],
  template: `
		@if (vm.loading()) {
			<div data-testid="recipe-detail-loading" class="flex items-center justify-center py-24">
				<p class="font-sans text-lg text-gray-500">Loading recipe...</p>
			</div>
		} @else if (vm.errorState(); as state) {
			@if (state.kind === "error") {
				<div data-testid="recipe-detail-error" class="flex items-center justify-center py-24">
					<p class="font-sans text-lg text-red-600">{{ state.message }}</p>
				</div>
			} @else {
				<div data-testid="recipe-detail-not-found" class="flex items-center justify-center py-24">
					<p class="font-sans text-lg text-gray-500">Recipe not found.</p>
				</div>
			}
		} @else if (vm.recipe(); as recipe) {
			<div data-testid="recipe-detail-content" class="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
				<!-- Header -->
				<app-recipe-header />

				<div class="flex gap-8">
					<!-- Ingredient List -->
					@if (activeVariant(); as variant) {
						<app-recipe-ingredient-list class="basis-1/3" [variant]="variant" />

						<!-- Steps -->
						<app-recipe-steps class="grow" [variant]="variant" />
					}
				</div>
			</div>
		} @else {
			<div data-testid="recipe-detail-not-found" class="flex items-center justify-center py-24">
				<p class="font-sans text-lg text-gray-500">Recipe not found.</p>
			</div>
		}
	`,
  providers: [provideRecipeDetailViewModel(), provideRecipeVariantViewModel()],
})
export class RecipeDetailPage {
  protected readonly vm = inject(RecipeDetailViewModel);
  protected readonly variantVm = inject(RecipeVariantViewModel, { optional: true });

  protected readonly activeVariant = computed(() => this.variantVm?.activeVariant() ?? null);
}
