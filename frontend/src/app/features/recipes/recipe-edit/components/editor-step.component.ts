import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrash } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";
import type { EditableStep } from "./recipe-component-editor.vm";

@Component({
  selector: "app-editor-step",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, FormField, ZardButtonComponent, ZardInputDirective],
  template: `
    <div class="flex items-start gap-2 border border-stone-100 rounded-lg p-3">
      <span class="text-teal-600 font-medium shrink-0 pt-2">{{ index() + 1 }}.</span>
      <input
        z-input
        [formField]="stepForm().body"
        placeholder="Step instruction..."
        class="w-full"
      />
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
  `,
  viewProviders: [provideIcons({ lucideTrash })],
})
export class EditorStepComponent {
  readonly stepForm = input.required<FieldTree<EditableStep>>();
  readonly index = input.required<number>();
  readonly delete = output();
}
