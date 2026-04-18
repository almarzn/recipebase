import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormField, FormRoot } from "@angular/forms/signals";
import { ZardAlertComponent } from "@/shared/components/alert";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";

import { RecipeVariantEditViewModel } from "./recipe-variant-edit.vm";

@Component({
  selector: "app-recipe-edit-variant",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeVariantEditViewModel],
  imports: [FormField, ZardInputDirective, ZardButtonComponent, ZardAlertComponent, FormRoot],
  template: `
    <form class="flex flex-col gap-6" [formRoot]="vm.form">
      <div>

        <h2 class="font-bold text-teal-600 flex flex-col gap-2 text-lg" data-testid="variant-name">{{ vm.variant()?.name }}</h2>
        <h1 class="font-serif text-4xl" data-testid="variant-heading">Basic informations</h1>
      </div>
      <p class="text-sm text-stone-500">Edit variant general details.</p>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium uppercase text-stone-500 tracking-wide" for="variant-name">Name</label>
        <input
          id="variant-name"
          z-input
          zSize="lg"
          type="text"
          placeholder="Variant name"
          [formField]="vm.nameField"
          [class.is-invalid]="vm.nameField().touched() && vm.nameField().invalid()"
        />
        @if (vm.nameField().touched() && vm.nameField().invalid()) {
          <p class="text-sm text-red-500">{{ vm.nameField().errors()[0].message }}</p>
        }
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium uppercase text-stone-500 tracking-wide" for="variant-description">Description</label>
        <textarea
          id="variant-description"
          z-input
          zSize="lg"
          rows="4"
          placeholder="Variant description"
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
export class RecipeEditVariantComponent {
  protected readonly vm = inject(RecipeVariantEditViewModel);
}
