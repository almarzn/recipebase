import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLayers, lucideNotebookText } from "@ng-icons/lucide";
import { RecipeEditViewModel } from "./recipe-edit.vm";

@Component({
  selector: "app-recipe-edit-nav",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, RouterLinkActive],
  template: `
    <nav class="flex flex-row md:flex-col gap-4 md:gap-6 overflow-x-auto md:overflow-visible text-sm pb-2 md:pb-0" data-testid="recipe-edit-nav">
      <a
        routerLink="info"
        class="p-3 flex gap-3 items-center rounded-md transition-colors flex-shrink-0"
        routerLinkActive="bg-stone-200/50 text-teal-900"
        data-testid="recipe-edit-info-link"
      >
        <span class="bg-teal-800 aspect-square flex items-center justify-center text-2xl p-2 rounded-md">
            <ng-icon name="lucideNotebookText " class="text-teal-300"/>
        </span>

        <span class="flex flex-col">

        <span class="font-serif text-base tracking-wide" data-testid="recipe-edit-title">
          {{ vm.recipe.value()?.name ?? 'Recipe Title' }}
        </span>

        <div class="text-xs flex gap-2 items-center text-stone-500">
          Basic informations
        </div>
        </span>
      </a>

      <div class="hidden md:block h-px bg-stone-200 mx-4"></div>

      <div class="flex flex-row md:flex-col gap-2 shrink-0 text-stone-900/50">
        <a
          routerLink="components"
          class="px-4 py-3 flex gap-2 items-center rounded-md transition-colors whitespace-nowrap"
          routerLinkActive="bg-stone-200/50 text-teal-800"
          data-testid="recipe-components-link"
        >
          <ng-icon name="lucideLayers" class="size-40 text-teal-800"/>
          <span class="text-sm uppercase font-semibold tracking-wider" data-testid="recipe-components-text">
              Components
          </span>
        </a>
      </div>
    </nav>
  `,
  viewProviders: [provideIcons({ lucideLayers, lucideNotebookText })],
})
export class RecipeEditNavComponent {
  protected readonly vm = inject(RecipeEditViewModel);
}
