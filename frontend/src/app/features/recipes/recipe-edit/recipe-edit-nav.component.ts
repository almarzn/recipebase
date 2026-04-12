import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideInfo, lucidePencil } from "@ng-icons/lucide";
import { ZardSelectComponent } from "@/shared/components/select/select.component";
import { ZardSelectItemComponent } from "@/shared/components/select/select-item.component";
import { RecipeEditViewModel } from "./recipe-edit.vm";

@Component({
  selector: "app-recipe-edit-nav",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, RouterLinkActive, ZardSelectComponent, ZardSelectItemComponent],
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
      <h3 class="uppercase text-xs tracking-wide text-stone-500">Variants</h3>
      <z-select
        zIcon="expand"
        zPlaceholder="Select a variant..."
        [value]="vm.variantSlug()"
        (valueChange)="setActiveVariant($event)"
        data-testid="recipe-edit-variant-select"
      >
        @for (variant of vm.variants(); track variant.slug) {
          <z-select-item [zValue]="variant.slug" [attr.data-testid]="'variant-option-' + variant.slug">{{ variant.name }}</z-select-item>
        }
      </z-select>
    </nav>
  `,
  viewProviders: [provideIcons({ lucidePencil, lucideInfo })],
})
export class RecipeEditNavComponent {
  protected readonly vm = inject(RecipeEditViewModel);

  setActiveVariant(slug: string | string[]) {
    if (Array.isArray(slug)) {
      this.setActiveVariant(slug[0]);
      return;
    }
    this.vm.setActiveVariant(slug);
  }
}
