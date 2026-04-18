import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ZardBadgeComponent } from "@/shared/components/badge";
import type { Recipe } from "@/shared/models";

@Component({
  selector: "app-recipe-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardBadgeComponent],
  template: `
    <div data-testid="recipe-header" class="flex">
      <div class="flex flex-col gap-6 grow">
        <div class="flex flex-col gap-2">
          <h1 data-testid="recipe-title" class="font-serif text-4xl text-teal-800 leading-tight">
            {{ recipe().name }}
          </h1>
          @if (recipe().yield) {
            <p data-testid="recipe-yield" class="font-sans text-lg text-gray-600">
              Yields: {{ recipe().yield!.quantity }} {{ recipe().yield!.unit }}
            </p>
          }
        </div>

        @if (recipe().tags.length > 0) {
          <div data-testid="recipe-tags" class="flex flex-wrap gap-2">
            @for (tag of recipe().tags; track tag) {
              <z-badge zType="secondary">{{ tag }}</z-badge>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class RecipeHeaderComponent {
  readonly recipe = input.required<Recipe>();
}
