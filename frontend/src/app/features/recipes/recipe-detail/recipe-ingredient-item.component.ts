import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { Ingredient } from "@/shared/models";
import { formatQuantity } from "@/shared/utils";

@Component({
  selector: "app-recipe-ingredient-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li data-testid="ingredient-item" class="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div class="flex flex-col gap-1 flex-1">
        <div class="flex items-baseline gap-2 flex-wrap">
          <span data-testid="ingredient-name" class="font-sans font-medium grow">
            {{ ingredient().name }}
          </span>
          <span data-testid="ingredient-quantity" class="font-sans text-teal-600 font-bold">
            {{ formatQuantity(ingredient().quantity, { unitDisplay: 'short'}) }}
          </span>
        </div>
        @if (ingredient().notes) {
          <span data-testid="ingredient-notes" class="font-sans text-sm text-gray-500 italic">
            {{ ingredient().notes }}
          </span>
        }
      </div>
    </li>
  `,
})
export class RecipeIngredientItemComponent {
  readonly ingredient = input.required<Ingredient>();
  readonly formatQuantity = formatQuantity;
}
