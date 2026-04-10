import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeSummary } from '@/shared/models';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';

@Component({
  selector: 'app-recipe-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ZardCardComponent, ZardBadgeComponent],
  template: `
    <a [routerLink]="['/recipes', recipe().slug]" data-testid="recipe-card" class="block">
      <z-card
        [zTitle]="recipe().title"
        [zDescription]="recipe().description ?? ''"
        class="transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
        headerClass="font-serif"
      >
        @if (recipe().variants.length > 0) {
          <div class="mt-2 flex flex-wrap gap-2" data-testid="recipe-variants">
            @for (variant of recipe().variants; track variant.slug) {
              <z-badge
                data-testid="recipe-variant-badge"
                zShape="pill"
                zType="outline"
              >
                {{ variant.name }}
              </z-badge>
            }
          </div>
        }

        <p data-testid="recipe-date" class="mt-3 text-xs text-gray-400">
          {{ formatDate(recipe().createdAt) }}
        </p>
      </z-card>
    </a>
  `,
})
export class RecipeCardComponent {
  readonly recipe = input.required<RecipeSummary>();
  readonly selected = output<string>();

  protected formatDate(iso: string): string {
    const pdt = Temporal.PlainDateTime.from(iso.endsWith('Z') ? iso.slice(0, -1) : iso);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[pdt.month - 1]} ${pdt.day}, ${pdt.year}`;
  }
}
