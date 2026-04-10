import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RecipeListViewModel } from './recipe-list.vm';

@Component({
  selector: 'app-recipe-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeListViewModel],
  template: `
    @if (vm.loading()) {
      <p data-testid="recipe-list-loading">Loading recipes...</p>
    } @else if (vm.error()) {
      <p data-testid="recipe-list-error" class="text-red-500">{{ vm.error() }}</p>
    } @else if (!vm.hasRecipes()) {
      <p data-testid="recipe-list-empty">No recipes found.</p>
    } @else {
      <p data-testid="recipe-list-count">{{ vm.recipeCount() }} recipe(s)</p>
    }
  `,
})
export class RecipeListPage {
  protected readonly vm = inject(RecipeListViewModel);
}
