import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardCardComponent } from "@/shared/components/card";

import type { Variant } from "@/shared/models";
import { formatQuantity } from "@/shared/utils";

@Component({
  selector: "app-recipe-ingredient-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardCardComponent, ZardBadgeComponent],
  template: `
    <z-card data-testid="ingredient-list-card" class="bg-white border border-gray-200">
      <div class="flex flex-col gap-6 p-2">
        <h2 data-testid="ingredients-heading" class="text-lg font-bold text-teal-800">
          Ingredients
        </h2>

        @if (allIngredients().length === 0) {
          <p data-testid="ingredients-empty" class="font-sans text-base text-gray-500">
            No ingredients listed for this recipe.
          </p>
        } @else {
          <div data-testid="ingredients-content" class="flex flex-col gap-6">
            @for (group of ingredientGroups(); track group.component.id) {
              <div data-testid="ingredient-group" class="flex flex-col gap-3">
                <!-- Component Title -->
<!--                @if (group.component.description) {-->
<!--                  <p class="font-sans text-sm text-gray-600 leading-relaxed">-->
<!--                    {{ group.component.description }}-->
<!--                  </p>-->
<!--                }-->

                <!-- Ingredients List -->
                <ul class="flex flex-col gap-1">
                  <h3 data-testid="component-title" class="text-md uppercase font-bold uppercase text-gray-400 border-b border-gray-100 text-sm tracking-widest">
                    {{ group.component.title }}
                  </h3>
                  @for (ingredient of group.ingredients; track ingredient.slug) {
                    <li data-testid="ingredient-item" class="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
                      <div class="flex flex-col gap-1 flex-1">
                        <div class="flex items-baseline gap-2 flex-wrap" >
                          <span data-testid="ingredient-name" class="font-sans font-medium grow">
                            {{ ingredient.name }}
                          </span>
                          <span data-testid="ingredient-quantity" class="font-sans text-teal-600 font-bold">
                            {{ formatQuantity(ingredient.quantity, { unitDisplay: 'short'}) }}
                          </span>
                        </div>
                        @if (ingredient.notes) {
                          <span data-testid="ingredient-notes" class="font-sans text-sm text-gray-500 italic">
                            {{ ingredient.notes }}
                          </span>
                        }
                      </div>
                    </li>
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

  protected readonly formatQuantity = formatQuantity;
}
