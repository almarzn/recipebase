import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import { ErrorStateComponent } from "@/shared/components/error-state";
import type { Step } from "@/shared/models";
import { RecipeStepItemComponent } from "./recipe-step-item.component";

@Component({
  selector: "app-recipe-steps",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorStateComponent, RecipeStepItemComponent],
  template: `
    <div data-testid="recipe-steps" class="flex flex-col gap-6">
      <h2 data-testid="steps-heading" class="text-lg font-bold text-teal-800">
        Instructions
      </h2>

      @if (steps().length === 0) {
        <app-error-state
          data-testid="steps-empty"
          message="No instructions listed for this recipe."
        />
      } @else {
        <div data-testid="steps-content" class="flex flex-col gap-4">
          <ol class="flex flex-col gap-4">
            @for (step of steps(); track step.id; let i = $index) {
              <app-recipe-step-item [step]="step" [stepIndex]="i" />
            }
          </ol>
        </div>
      }
    </div>
  `,
})
export class RecipeStepsComponent {
  readonly steps = input.required<Step[]>();
}
