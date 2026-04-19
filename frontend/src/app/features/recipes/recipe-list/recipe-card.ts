import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ZardBadgeComponent } from "@/shared/components/badge/badge.component";
import { ZardCardComponent } from "@/shared/components/card/card.component";
import type { Item } from "@/shared/models";

@Component({
  selector: "app-recipe-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ZardCardComponent, ZardBadgeComponent],
  template: `
    <a [routerLink]="['/recipes', item().slug]" data-testid="recipe-card" class="block">
      <z-card
        [zTitle]="item().name"
        class="transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
        titleClass="font-serif text-lg"
      >
        @if (item().tags.length > 0) {
          <div class="mt-2 flex flex-wrap gap-2" data-testid="recipe-tags">
            @for (tag of item().tags; track tag) {
              <z-badge
                data-testid="recipe-tag-badge"
                zShape="pill"
                zType="outline"
              >
                {{ tag }}
              </z-badge>
            }
          </div>
        }
      </z-card>
    </a>
  `,
})
export class RecipeCardComponent {
  readonly item = input.required<Item>();
}
