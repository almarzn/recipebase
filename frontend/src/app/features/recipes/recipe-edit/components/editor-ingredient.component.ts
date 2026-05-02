import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertCircle, lucideTrash } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardInputGroupComponent } from "@/shared/components/input-group";
import { ZardTooltipImports } from "@/shared/components/tooltip";
import type { EditableIngredient } from "./recipe-component-editor.vm";

@Component({
  selector: "app-editor-ingredient",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, FormField, ZardButtonComponent, ZardInputDirective, ZardInputGroupComponent, ...ZardTooltipImports],
  template: `
    <div class="flex flex-col gap-2 border border-stone-100 rounded-lg p-3">
      <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
        <input
          z-input
          [formField]="ingredientForm().name"
          placeholder="Ingredient name"
          class="w-full"
        />
        <z-input-group
          class="w-32"
          [class.border-destructive!]="isQuantityError()"
          [zAddonAfter]="isQuantityError() ? errorIcon : ''"
        >
          <input
            z-input
            [formField]="ingredientForm().quantity"
            placeholder="Quantity"
          />
        </z-input-group>
        <button
          z-button
          zType="ghost"
          zSize="icon-xs"
          (click)="delete.emit()"
          class="shrink-0"
        >
          <ng-icon name="lucideTrash" />
        </button>
      </div>
      <textarea
        z-input
        zType="textarea"
        [formField]="ingredientForm().notes"
        placeholder="Add notes..."
        class="w-full min-h-[40px] border-none"
      ></textarea>
    </div>

    <ng-template #errorIcon>
        <div class="flex items-center"
            [zTooltip]="quantityErrorMessage()"
            data-testid="ingredient-quantity-error">
      <ng-icon
        name="lucideAlertCircle"
        class="text-destructive size-4"
      />
        </div>
    </ng-template>
  `,
  viewProviders: [provideIcons({ lucideAlertCircle, lucideTrash })],
})
export class EditorIngredientComponent {
  readonly ingredientForm = input.required<FieldTree<EditableIngredient>>();
  readonly delete = output();

  protected readonly isQuantityError = computed(() => {
    const q = this.ingredientForm().quantity();
    return q.touched() && q.invalid();
  });

  protected readonly quantityErrorMessage = computed(() => {
    const q = this.ingredientForm().quantity();
    const errors = q.errors();
    return errors?.map((e) => e.message).join(". ") ?? "";
  });
}
