import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import { ZardCardComponent } from "@/shared/components/card";
import { ErrorStateComponent } from "@/shared/components/error-state";
import type { Ingredient } from "@/shared/models";
import { RecipeIngredientItemComponent } from "./recipe-ingredient-item.component";

@Component({
	selector: "app-recipe-ingredient-list",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ErrorStateComponent,
		RecipeIngredientItemComponent,
		ZardCardComponent,
	],
	template: `
    <z-card data-testid="ingredient-list-card" class="bg-white border border-gray-200">
      <div class="flex flex-col gap-2 p-2">
        <h2 data-testid="ingredients-heading" class="text-sm uppercase text-stone-500">
          Ingredients
        </h2>

        @if (ingredients().length === 0) {
          <app-error-state
            data-testid="ingredients-empty"
            message="No ingredients listed for this recipe."
          />
        } @else {
          <div data-testid="ingredients-content" class="flex flex-col gap-3">
            <ul class="flex flex-col gap-1">
              @for (ingredient of ingredients(); track ingredient.id) {
                <app-recipe-ingredient-item [ingredient]="ingredient" class=" border-b border-stone-100" />
              }
            </ul>
          </div>
        }
      </div>
    </z-card>
  `,
})
export class RecipeIngredientListComponent {
	readonly ingredients = input<Ingredient[]>([]);
}
