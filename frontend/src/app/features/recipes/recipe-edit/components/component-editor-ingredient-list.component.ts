import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCarrot, lucidePlus } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { EditorIngredientComponent } from "./editor-ingredient.component";
import type { EditableIngredient } from "./recipe-component-editor.vm";

@Component({
  selector: "app-component-editor-ingredient-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent, EditorIngredientComponent],
  template: `
    <section class="flex flex-col gap-4" data-testid="component-editor-ingredients">
      <div class="flex items-center gap-2 text-stone-500 font-medium uppercase text-xs tracking-wider border-b border-stone-200 pb-2">
        <ng-icon name="lucideCarrot" class="size-4" />
        <span>Ingredients</span>
      </div>

      @if (ingredientsForm().length > 0) {
        <div class="flex flex-col gap-3">
          @for (ingredientForm of ingredientsForm(); track $index) {
            <app-editor-ingredient
              [ingredientForm]="ingredientForm"
              [attr.data-testid]="'component-editor-ingredient-row-' + $index"
              (delete)="deleteIngredient.emit($index)"
            />
          }
        </div>
      }

      <button
        z-button
        zType="outline"
        zSize="sm"
        (click)="addIngredient.emit()"
        data-testid="component-editor-add-ingredient"
      >
        <ng-icon name="lucidePlus" class="size-4" />
        Add ingredient
      </button>
    </section>
  `,
  viewProviders: [provideIcons({ lucideCarrot, lucidePlus })],
})
export class ComponentEditorIngredientListComponent {
  readonly ingredientsForm = input.required<FieldTree<EditableIngredient[]>>();
  readonly deleteIngredient = output<number>();
  readonly addIngredient = output();
}
