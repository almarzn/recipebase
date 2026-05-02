import { ChangeDetectionStrategy, Component, effect, inject, input } from "@angular/core";
import { ZardButtonComponent } from "@/shared/components/button";
import type { ComponentResource } from "@/shared/server";
import { ComponentEditorIngredientListComponent } from "./component-editor-ingredient-list.component";
import { ComponentEditorStepsListComponent } from "./component-editor-steps-list.component";
import { RecipeComponentEditorViewModel } from "./recipe-component-editor.vm";

@Component({
  selector: "app-recipe-component-editor",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeComponentEditorViewModel],
  imports: [ZardButtonComponent, ComponentEditorIngredientListComponent, ComponentEditorStepsListComponent],
  template: `
    <div class="bg-white rounded-lg border border-stone-200 p-6 flex flex-col gap-6" data-testid="component-editor">
      <h3 class="font-serif text-2xl text-stone-800" data-testid="component-editor-title">
        {{ component().name || "Component 1" }}
      </h3>

      <app-component-editor-ingredient-list
        [ingredientsForm]="vm.ingredientsForm"
        (addIngredient)="vm.addIngredient()"
        (deleteIngredient)="vm.deleteIngredient($event)"
      />

      <app-component-editor-steps-list
        [stepsForm]="vm.stepsForm"
        (addStep)="vm.addStep()"
        (deleteStep)="vm.deleteStep($event)"
      />

      <!-- Save -->
      <div class="flex justify-end items-center gap-3 border-t border-stone-100 pt-4">
        @if (vm.ingredientsForm().invalid()) {
          <span class="text-sm text-destructive" data-testid="component-editor-save-error">
            Fix quantity errors before saving
          </span>
        }
        <button
          z-button
          zType="default"
          zSize="sm"
          (click)="vm.saveChanges()"
          data-testid="component-editor-save"
        >
          Save changes
        </button>
      </div>
    </div>
  `,
})
export class RecipeComponentEditorComponent {
  readonly component = input.required<ComponentResource>();
  protected readonly vm = inject(RecipeComponentEditorViewModel);

  constructor() {
    effect(() => {
      const comp = this.component();
      this.vm.component.set(comp);
    });
  }
}
