import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideChevronDown,
  lucideChevronUp,
  lucideNotebookPen,
  lucideTrash,
} from "@ng-icons/lucide";
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
      <div class="grid grid-cols-[1fr_auto] gap-2 items-center">
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
      </div>

      <div class="flex items-center gap-1" data-testid="ingredient-toolbar">
        @if (!isFirst()) {
          <button
            z-button
            zType="ghost"
            zSize="icon-xs"
            (click)="moveUp.emit()"
            data-testid="ingredient-move-up"
          >
            <ng-icon name="lucideChevronUp" />
          </button>
        }
        @if (!isLast()) {
          <button
            z-button
            zType="ghost"
            zSize="icon-xs"
            (click)="moveDown.emit()"
            data-testid="ingredient-move-down"
          >
            <ng-icon name="lucideChevronDown" />
          </button>
        }
        <button
          z-button
          zType="ghost"
          zSize="icon-xs"
          (click)="toggleNotes()"
          [class.border]="hasNotes()"
          data-testid="ingredient-toggle-notes"
        >
          <ng-icon name="lucideNotebookPen" [class.text-primary]="hasNotes()" />
        </button>
        <button
          z-button
          zType="ghost"
          zSize="icon-xs"
          (click)="delete.emit()"
          data-testid="ingredient-delete"
        >
          <ng-icon name="lucideTrash" />
        </button>
      </div>

      @if (showNotes()) {
        <textarea
          z-input
          zType="textarea"
          [formField]="ingredientForm().notes"
          placeholder="Add notes..."
          class="w-full min-h-[40px] border-none"
        ></textarea>
      }
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
  viewProviders: [
    provideIcons({ lucideAlertCircle, lucideChevronDown, lucideChevronUp, lucideNotebookPen, lucideTrash }),
  ],
})
export class EditorIngredientComponent {
  readonly ingredientForm = input.required<FieldTree<EditableIngredient>>();
  readonly isFirst = input(false);
  readonly isLast = input(false);
  readonly delete = output();
  readonly moveUp = output();
  readonly moveDown = output();

  protected readonly showNotes = signal(false);

  protected readonly hasNotes = computed(() => {
    const n = this.ingredientForm().notes();
    const val = n.value;
    return val() != null && val().trim() !== "";
  });

  protected readonly isQuantityError = computed(() => {
    const q = this.ingredientForm().quantity();
    return q.touched() && q.invalid();
  });

  protected readonly quantityErrorMessage = computed(() => {
    const q = this.ingredientForm().quantity();
    const errors = q.errors();
    return errors?.map((e) => e.message).join(". ") ?? "";
  });

  protected toggleNotes(): void {
    this.showNotes.update((v) => !v);
  }
}
