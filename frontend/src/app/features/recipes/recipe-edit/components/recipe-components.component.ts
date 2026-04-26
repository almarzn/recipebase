import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLayers } from "@ng-icons/lucide";
import { RecipeComponentEditorComponent } from "./recipe-component-editor.component";
import { RecipeComponentsViewModel } from "./recipe-components.vm";

@Component({
  selector: "app-recipe-components",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeComponentsViewModel],
  imports: [NgIcon, RecipeComponentEditorComponent],
  template: `
    <div class="flex flex-col gap-6" data-testid="components-page">
      <div>
        <h2 class="font-bold text-teal-600 flex flex-col gap-2 text-lg" data-testid="recipe-name">
          {{ vm.recipe.value()?.name }}
        </h2>
        <h1 class="font-serif text-4xl" data-testid="components-heading">Components</h1>
      </div>
      <p class="text-sm text-stone-500" data-testid="components-description">
        Edit ingredients and steps for the first component.
      </p>

      @if (vm.firstComponent(); as component) {
        <app-recipe-component-editor [component]="component" />
      } @else {
        <div class="flex flex-col items-center justify-center py-12 text-stone-500" data-testid="components-empty">
          <ng-icon name="lucideLayers" class="size-12 mb-4 opacity-50" />
          <p class="text-sm">No components yet.</p>
        </div>
      }
    </div>
  `,
  viewProviders: [provideIcons({ lucideLayers })],
})
export class RecipeComponentsComponent {
  protected readonly vm = inject(RecipeComponentsViewModel);
}
