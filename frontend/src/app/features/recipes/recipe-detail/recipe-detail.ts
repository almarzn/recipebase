import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RecipeDetailViewModel } from "./recipe-detail.vm";

@Component({
  selector: "app-recipe-detail",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeDetailViewModel],
  template: `
    @if (vm.loading()) {
      <p>Loading recipe...</p>
    } @else if (vm.error()) {
      <p class="text-red-500">{{ vm.error() }}</p>
    } @else if (vm.recipe()) {
      <h1>{{ vm.title() }}</h1>
      <p>{{ vm.variantCount() }} variant(s)</p>
    } @else {
      <p>Recipe not found.</p>
    }
  `,
})
export class RecipeDetailPage {
  protected readonly vm = inject(RecipeDetailViewModel);
}
