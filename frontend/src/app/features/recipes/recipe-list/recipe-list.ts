import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RecipeListViewModel } from "./recipe-list.vm";
import { RecipeCardComponent } from "./recipe-card";

@Component({
  selector: "app-recipe-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeListViewModel],
  imports: [RecipeCardComponent],
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
        <div
          data-testid="recipe-list-error"
          class="rounded-xl border border-red-200 p-6 text-red-600"
        >
          <p class="font-medium">Failed to load recipes</p>
          <p class="mt-1 text-sm text-red-500">{{ vm.error() }}</p>
        </div>
      } @else if (!vm.hasRecipes()) {
        <div
          data-testid="recipe-list-empty"
          class="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center"
        >
          <p class="font-serif text-2xl text-gray-400">No recipes yet</p>
          <p class="mt-2 text-sm text-gray-400">Start by importing your first recipe.</p>
        </div>
      } @else {
        <div data-testid="recipe-list-grid" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (recipe of vm.recipes(); track recipe.id) {
            <app-recipe-card [recipe]="recipe" />
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
