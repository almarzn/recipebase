import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { ZardCardComponent } from "@/shared/components/card";
import { ErrorStateComponent } from "@/shared/components/error-state";
import { ZardSkeletonComponent } from "@/shared/components/skeleton";
import {
	provideRecipeDetailViewModel,
	RecipeDetailViewModel,
} from "./recipe-detail.vm";
import { RecipeHeaderComponent } from "./recipe-header.component";
import { RecipeIngredientListComponent } from "./recipe-ingredient-list.component";
import { RecipeStepsComponent } from "./recipe-steps.component";

@Component({
	selector: "app-recipe-detail",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ErrorStateComponent,
		RecipeHeaderComponent,
		RecipeIngredientListComponent,
		RecipeStepsComponent,
		ZardCardComponent,
		ZardSkeletonComponent,
	],
	template: `
        @if (vm.loading()) {
        <div data-testid="recipe-detail-loading" class="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
            <div class="flex">
            <div class="flex flex-col gap-6 grow">
                <div class="flex flex-col gap-2">
                <z-skeleton class="h-10 w-3/4" />
                <z-skeleton class="h-6 w-1/2" />
                </div>
            </div>
            </div>

            <div class="flex gap-8">
            <div class="basis-1/3">
                <z-card class="bg-white border border-gray-200">
                <div class="flex flex-col gap-6 p-2">
                    <z-skeleton class="h-6 w-24" />
                    <div class="flex flex-col gap-3">
                    <z-skeleton class="h-4 w-20" />
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                        <div class="flex items-baseline justify-between py-2 border-b border-gray-100">
                        <z-skeleton class="h-4 w-2/3" />
                        <z-skeleton class="h-4 w-16" />
                        </div>
                    }
                    </div>
                </div>
                </z-card>
            </div>

            <div class="grow flex flex-col gap-6">
                <z-skeleton class="h-6 w-28" />
                <div class="flex flex-col gap-4">
                @for (i of [1, 2, 3, 4]; track i) {
                    <div class="flex gap-4 items-start">
                    <z-skeleton class="w-10 h-10 shrink-0" />
                    <div class="flex flex-col gap-2 flex-1 pt-2">
                        <z-skeleton [class]="'h-4 ' + (i % 2 === 0 ? 'w-full' : 'w-5/6')" />
                        @if (i === 1) {
                        <z-skeleton class="h-3 w-1/3" />
                        }
                    </div>
                    </div>
                }
                </div>
            </div>
            </div>
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
    } @else if (vm.recipe.value(); as recipe) {
        <div data-testid="recipe-detail-content" class="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
          <app-recipe-header [recipe]="recipe" />

          @for (component of vm.components(); track component.id) {
            <div data-testid="component-section" class="flex flex-col gap-6">
            @if (component.name) {
              <h2 data-testid="component-name" class="font-serif text-2xl font-semibold text-teal-800 flex gap-4">{{ component.name }} <span class="h-px self-center grow bg-stone-200"></span></h2>
            }
              <div class="flex gap-8">
                <app-recipe-ingredient-list class="basis-1/3" [ingredients]="component.ingredients" />
                <app-recipe-steps class="grow" [steps]="component.steps" />
              </div>
            </div>
          }
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
	providers: [provideRecipeDetailViewModel()],
})
export class RecipeDetailPage {
	protected readonly vm = inject(RecipeDetailViewModel);
}
