import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {lucideChevronsUpDown, lucideInfo, lucidePencil, lucideNotebookText } from "@ng-icons/lucide";
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
    <nav class="flex flex-col gap-6 text-sm" data-testid="recipe-edit-nav">
      <a
        routerLink="info"
        class="p-3 -mx-3 flex gap-3 items-center rounded-md transition-colors"
        routerLinkActive="bg-stone-200/50 text-teal-900"
        data-testid="recipe-edit-info-link"
      >
        <span class="bg-teal-800 aspect-square flex items-center justify-center text-2xl p-2 rounded-md">
            <ng-icon name="lucideNotebookText " class="text-teal-300"/>
        </span>

        <span class="flex flex-col">

        <span class="font-serif text-base tracking-wide" data-testid="recipe-edit-title">
          {{ vm.recipe()?.title ?? 'Recipe Title' }}
        </span>

        <div class="text-xs flex gap-2 items-center text-stone-500">
          Basic informations
        </div>
        </span>
      </a>

      <div class="h-px bg-stone-200 mx-4"></div>

      <div class="flex flex-col gap-2" >
        <h3 class="uppercase text-xs tracking-wide text-stone-500">Variants</h3>
        <button
          type="button"
          z-dropdown
          [zDropdownMenu]="variantMenu"
          class="flex w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm hover:bg-stone-50"
          data-testid="recipe-edit-variant-select"
        >
          <span>{{ vm.activeVariant()?.name ?? 'Select a variant...' }}</span>
          <ng-icon name="lucideChevronsUpDown" class="size-4 opacity-50"/>
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

      @if (vm.activeVariant(); as variant) {
        <div class="flex flex-col gap-2">

          <a
            [routerLink]="['variants', variant.slug]"
            class="px-4 py-3 flex gap-2 items-center rounded-md transition-colors"
            routerLinkActive="bg-stone-200/50 text-teal-800"
            data-testid="variant-edit-info-link"
          >
            <ng-icon name="lucideInfo" class="size-40 text-teal-800"/>
            <span class="text-sm uppercase font-semibold tracking-wider" data-testid="variant-edit-info">
          Basic informations
        </span>
          </a>
        </div>
      }
    </nav>
  `,
  viewProviders: [provideIcons({ lucidePencil, lucideChevronsUpDown, lucideInfo, lucideNotebookText })],
})
export class RecipeEditNavComponent {
  protected readonly vm = inject(RecipeEditViewModel);
}
