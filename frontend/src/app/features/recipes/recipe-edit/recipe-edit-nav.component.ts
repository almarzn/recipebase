import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronsUpDown, lucidePencil } from "@ng-icons/lucide";
import { ZardDropdownMenuItemComponent } from "@/shared/components/dropdown/dropdown-item.component";
import { ZardDropdownMenuContentComponent } from "@/shared/components/dropdown/dropdown-menu-content.component";
import { ZardDropdownDirective } from "@/shared/components/dropdown/dropdown-trigger.directive";
import { RecipeEditViewModel } from "./recipe-edit.vm";

@Component({
  selector: "app-recipe-edit-nav",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgIcon,
    RouterLinkActive,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
  ],
  template: `
    <nav class="flex flex-col gap-4 text-sm" data-testid="recipe-edit-nav">
      <a
        routerLink="info"
        class="px-5 py-3 flex flex-col gap-0.5 items-start rounded-md transition-colors"
        routerLinkActive="bg-stone-200/50 text-teal-900"
        data-testid="recipe-edit-info-link"
      >
        <span class="font-serif text-base tracking-wide" data-testid="recipe-edit-title">
          {{ vm.recipe()?.title ?? 'Recipe Title' }}
        </span>

        <div class="text-xs flex gap-2 items-center text-stone-500">
          <ng-icon name="lucidePencil" />

          Basic informations
        </div>
      </a>

      <div class="h-px bg-stone-200 mx-5"></div>

      <div class="flex flex-col gap-2 px-5">
          <h3 class="uppercase text-xs tracking-wide text-stone-500">Variants</h3>
          <button
            type="button"
            z-dropdown
            [zDropdownMenu]="variantMenu"
            class="flex w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm hover:bg-stone-50"
            data-testid="recipe-edit-variant-select"
          >
            <span>{{ vm.activeVariant()?.name ?? 'Select a variant...' }}</span>
            <ng-icon name="lucideChevronsUpDown" class="size-4 opacity-50" />
          </button>
          <z-dropdown-menu-content #variantMenu="zDropdownMenuContent" class="w-full">
            @for (variant of vm.variants(); track variant.slug) {
              <z-dropdown-menu-item
                (click)="vm.setActiveVariant(variant.slug)"
                [attr.data-testid]="'variant-option-' + variant.slug"
              >
                {{ variant.name }}
              </z-dropdown-menu-item>
            }
          </z-dropdown-menu-content>
      </div>
    </nav>
  `,
  viewProviders: [provideIcons({ lucidePencil, lucideChevronsUpDown })],
})
export class RecipeEditNavComponent {
  protected readonly vm = inject(RecipeEditViewModel);
}
