import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePen } from "@ng-icons/lucide";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import type { Recipe } from "@/shared/models";
import { formatQuantity } from "@/shared/utils/unit";

@Component({
  selector: "app-recipe-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardBadgeComponent, ZardButtonComponent, NgIcon, RouterLink],
  template: `
    <div data-testid="recipe-header" class="flex">
      <div class="flex flex-col gap-6 grow">
        <div class="flex flex-col gap-2">
          <h1 data-testid="recipe-title" class="font-serif text-4xl text-teal-800 leading-tight">
            {{ recipe().name }}
          </h1>
          @if (recipe().yield) {
            <p data-testid="recipe-yield" class="font-sans text-lg text-gray-600">
              Yields: {{ formatYield(recipe().yield!) }}
            </p>
          }
        </div>

        @if (recipe().tags.length) {
          <div data-testid="recipe-tags" class="flex flex-wrap gap-2">
            @for (tag of recipe().tags; track tag) {
              <z-badge zType="secondary">{{ tag }}</z-badge>
            }
          </div>
        }
      </div>

      <div class="flex gap-4">
          <a routerLink="/recipes/{{ recipe().slug }}/edit" z-button zShape="circle" class="px-3" zSize="lg" zType="outline"><ng-icon name="lucidePen"></ng-icon>Edit recipe</a>
      </div>
    </div>
  `,
  viewProviders: [
    provideIcons({
      lucidePen,
    }),
  ],
})
export class RecipeHeaderComponent {
  readonly recipe = input.required<Recipe>();

  formatYield(y: NonNullable<Recipe["yield"]>): string {
    if (y.quantity) {
      return formatQuantity(y.quantity, { unitDisplay: "long" });
    }
    return "";
  }
}
