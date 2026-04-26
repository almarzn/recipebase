import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrash } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";
import type { EditableIngredient } from "./recipe-component-editor.vm";

@Component({
  selector: "app-editor-ingredient",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, FormField, ZardButtonComponent, ZardInputDirective],
  template: `
    <div class="flex flex-col gap-2 border border-stone-100 rounded-lg p-3">
      <div class="grid grid-cols-[1fr,auto,auto] gap-2 items-start">
        <input
          z-input
          [formField]="ingredientForm().name"
          placeholder="Ingredient name"
          class="w-full"
        />
        <div class="flex flex-col gap-1">
          <input
            z-input
            [formField]="ingredientForm().quantity"
            placeholder="Quantity"
            class="w-32"
            [class.border-destructive]="ingredientForm().quantity().touched() && ingredientForm().quantity().invalid()"
          />
          @if (ingredientForm().quantity().touched() && ingredientForm().quantity().invalid()) {
            @for (err of ingredientForm().quantity().errors(); track err.kind) {
              <span class="text-xs text-destructive">{{ err.message }}</span>
            }
          }
        </div>
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
        class="w-full min-h-[40px]"
      ></textarea>
    </div>
  `,
  viewProviders: [provideIcons({ lucideTrash })],
})
export class EditorIngredientComponent {
  readonly ingredientForm = input.required<FieldTree<EditableIngredient>>();
  readonly delete = output();
}
