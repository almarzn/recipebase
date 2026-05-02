import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FieldTree } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideListOrdered, lucidePlus } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { EditorStepComponent } from "./editor-step.component";
import type { EditableStep } from "./recipe-component-editor.vm";

@Component({
  selector: "app-component-editor-steps-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent, EditorStepComponent],
  template: `
    <section class="flex flex-col gap-4" data-testid="component-editor-steps">
      <div class="flex items-center gap-2 text-stone-500 font-medium uppercase text-xs tracking-wider border-b border-stone-200 pb-2">
        <ng-icon name="lucideListOrdered" class="size-4" />
        <span>Steps</span>
      </div>

      @if (stepsForm().length > 0) {
        <div class="flex flex-col gap-3">
          @for (stepForm of stepsForm(); track $index) {
            <app-editor-step
              [stepForm]="stepForm"
              [index]="$index"
              [attr.data-testid]="'component-editor-step-row-' + $index"
              (delete)="deleteStep.emit($index)"
            />
          }
        </div>
      }

      <button
        z-button
        zType="outline"
        zSize="sm"
        (click)="addStep.emit()"
        data-testid="component-editor-add-step"
      >
        <ng-icon name="lucidePlus" class="size-4" />
        Add step
      </button>
    </section>
  `,
  viewProviders: [provideIcons({ lucideListOrdered, lucidePlus })],
})
export class ComponentEditorStepsListComponent {
  readonly stepsForm = input.required<FieldTree<EditableStep[]>>();
  readonly deleteStep = output<number>();
  readonly addStep = output();
}
