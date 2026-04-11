import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { ZardCardComponent } from "@/shared/components/card";
import { ErrorStateComponent } from "@/shared/components/error-state";
import type { Variant } from "@/shared/models";
import { RecipeIngredientItemComponent } from "./recipe-ingredient-item.component";

@Component({
  selector: "app-recipe-ingredient-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorStateComponent, RecipeIngredientItemComponent, ZardCardComponent],
  template: `
    <z-card data-testid="ingredient-list-card" class="bg-white border border-gray-200">
      <div class="flex flex-col gap-6 p-2">
        <h2 data-testid="ingredients-heading" class="text-lg font-bold text-teal-800">
          Ingredients
        </h2>

        @if (allIngredients().length === 0) {
          <app-error-state
            data-testid="ingredients-empty"
            message="No ingredients listed for this recipe."
          />
        } @else {
          <div data-testid="ingredients-content" class="flex flex-col gap-6">
            @for (group of ingredientGroups(); track group.component.id) {
              <div data-testid="ingredient-group" class="flex flex-col gap-3">
                <ul class="flex flex-col gap-1">
                  <h3
                    data-testid="component-title"
                    class="text-md uppercase font-bold text-gray-400 border-b border-gray-100 text-sm tracking-widest"
                  >
                    {{ group.component.title }}
                  </h3>
                  @for (ingredient of group.ingredients; track ingredient.slug) {
                    <app-recipe-ingredient-item [ingredient]="ingredient" />
                  }
                </ul>
              </div>
            }
          </div>
        }
      </div>
    </z-card>
  `,
})
export class RecipeIngredientListComponent {
  readonly variant = input.required<Variant>();

  protected readonly ingredientGroups = computed(() => {
    const components = this.variant().components;
    return components.map((component) => ({
      component,
      ingredients: component.ingredients,
    }));
  });

  protected readonly allIngredients = computed(() => {
    return this.variant().components.flatMap((c) => c.ingredients);
  });
}
