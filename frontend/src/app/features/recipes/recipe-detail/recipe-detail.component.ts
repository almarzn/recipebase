import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";

import { ErrorStateComponent } from "@/shared/components/error-state";
import { provideRecipeDetailViewModel, RecipeDetailViewModel } from "./recipe-detail.vm";
import { RecipeHeaderComponent } from "./recipe-header.component";
import { RecipeIngredientListComponent } from "./recipe-ingredient-list.component";
import { RecipeStepsComponent } from "./recipe-steps.component";
import { provideRecipeVariantViewModel, RecipeVariantViewModel } from "./recipe-variant.vm";

@Component({
  selector: "app-recipe-detail",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorStateComponent, RecipeHeaderComponent, RecipeIngredientListComponent, RecipeStepsComponent],
  template: `
    @if (vm.loading()) {
      <div data-testid="recipe-detail-loading" class="flex items-center justify-center py-24">
        <app-error-state message="Loading recipe..." subtext="Please wait while we fetch the recipe details." />
      </div>
    } @else if (vm.errorState(); as state) {
      @if (state.kind === "error") {
        <div data-testid="recipe-detail-error" class="flex items-center justify-center py-24">
          <app-error-state 
            message="Something went wrong" 
            subtext="We couldn't load this recipe. Please try again later."
            [detail]="state.message"
            icon="network" />
        </div>
      } @else {
        <div data-testid="recipe-detail-not-found" class="flex items-center justify-center py-24">
          <app-error-state 
            message="Recipe not found" 
            subtext="The recipe you're looking for doesn't exist or may have been removed."
            icon="not-found" />
        </div>
      }
    } @else if (vm.recipe(); as recipe) {
      <div data-testid="recipe-detail-content" class="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
        <app-recipe-header />

        <div class="flex gap-8">
          @if (activeVariant(); as variant) {
            <app-recipe-ingredient-list class="basis-1/3" [variant]="variant" />
            <app-recipe-steps class="grow" [variant]="variant" />
          }
        </div>
      </div>
    } @else {
      <div data-testid="recipe-detail-not-found" class="flex items-center justify-center py-24">
        <app-error-state 
          message="Recipe not found" 
          subtext="The recipe you're looking for doesn't exist or may have been removed."
          icon="not-found" />
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
