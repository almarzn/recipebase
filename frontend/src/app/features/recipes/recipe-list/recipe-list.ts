import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RecipeListViewModel } from './recipe-list.vm';

@Component({
  selector: 'app-recipe-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeListViewModel],
  template: `
    @if (vm.loading()) {
      <p>Loading recipes...</p>
    } @else if (vm.error()) {
      <p class="text-red-500">{{ vm.error() }}</p>
    } @else if (!vm.hasRecipes()) {
      <p>No recipes found.</p>
    } @else {
      <p>{{ vm.recipeCount() }} recipe(s)</p>
    }
  `,
})
export class RecipeListPage {
  protected readonly vm = inject(RecipeListViewModel);
}
