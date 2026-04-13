import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormField, FormRoot } from "@angular/forms/signals";
import { ZardAlertComponent } from "@/shared/components/alert";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";

import { RecipeEditInfoViewModel } from "./recipe-edit-info.vm";

@Component({
  selector: "app-recipe-edit-info",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeEditInfoViewModel],
  imports: [FormField, ZardInputDirective, ZardButtonComponent, ZardAlertComponent, FormRoot],
  template: `
    <form class="flex flex-col gap-4" [formRoot]="vm.form">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium uppercase text-stone-500 tracking-wide" for="recipe-title">Title</label>
        <input
          id="recipe-title"
          z-input
          zSize="lg"
          type="text"
          placeholder="Recipe title"
          [formField]="vm.titleField"
          [class.is-invalid]="vm.titleField().touched() && vm.titleField().invalid()"
        />
        @if (vm.titleField().touched() && vm.titleField().invalid()) {
          <p class="text-sm text-red-500">{{ vm.titleField().errors()[0].message }}</p>
        }
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium uppercase text-stone-500 tracking-wide" for="recipe-description">Description</label>
        <textarea
          id="recipe-description"
          z-input
          zSize="lg"
          rows="4"
          placeholder="Recipe description"
          [formField]="vm.descriptionField"
          [class.is-invalid]="vm.descriptionField().touched() && vm.descriptionField().invalid()"
        ></textarea>
        @if (vm.descriptionField().touched() && vm.descriptionField().invalid()) {
          <p class="text-sm text-red-600">{{ vm.descriptionField().errors()[0].message }}</p>
        }
      </div>

      @if (vm.submitError()) {
        <z-alert zType="destructive">{{ vm.submitError() }}</z-alert>
      }

      <div>
        <button
          z-button
          zType="default"
          zSize="lg"
          class="px-4"
          [zLoading]="vm.submitting()"
          [disabled]="vm.submitting() || !vm.hasChanges()"
        >
          Save
        </button>
      </div>
    </form>
  `,
})
export class RecipeEditInfoComponent {
  protected readonly vm = inject(RecipeEditInfoViewModel);
}
