import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ErrorStateComponent } from "@/shared/components/error-state";
import { RecipeCardComponent } from "./recipe-card";
import { RecipeListViewModel } from "./recipe-list.vm";

@Component({
  selector: "app-recipe-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeListViewModel],
  imports: [ErrorStateComponent, RecipeCardComponent],
  template: `
    <div class="px-6 py-8 md:px-24 md:py-12">
      <h1 class="text-4xl font-serif">My recipes</h1>
    </div>
    <div class="px-24 py-12">
      @if (vm.loading()) {
        <div data-testid="recipe-list-loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (_ of skeletons; track $index) {
            <div class="rounded-xl border border-gray-200 bg-white p-6">
              <div class="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
              <div class="mt-3 h-4 w-full animate-pulse rounded bg-gray-100"></div>
              <div class="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100"></div>
              <div class="mt-4 flex gap-2">
                <div class="h-6 w-16 animate-pulse rounded-full bg-gray-100"></div>
                <div class="h-6 w-20 animate-pulse rounded-full bg-gray-100"></div>
              </div>
              <div class="mt-4 h-3 w-24 animate-pulse rounded bg-gray-100"></div>
            </div>
          }
        </div>
      } @else if (vm.error()) {
        <div data-testid="recipe-list-error">
          <app-error-state message="Failed to load recipes" [detail]="vm.error()" />
        </div>
      } @else if (!vm.hasItems()) {
        <div data-testid="recipe-list-empty">
          <app-error-state message="No recipes yet" detail="Start by importing your first recipe." />
        </div>
      } @else {
        <div data-testid="recipe-list-grid" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (item of vm.items(); track item.id) {
            <app-recipe-card [item]="item" />
          }
        </div>
      }
    </div>
  `,
})
export class RecipeListPage {
  protected readonly vm = inject(RecipeListViewModel);
  protected readonly skeletons = Array(3);
}
