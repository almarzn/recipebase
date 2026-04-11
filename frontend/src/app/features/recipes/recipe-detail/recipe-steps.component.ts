import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { ErrorStateComponent } from "@/shared/components/error-state";
import type { Variant } from "@/shared/models";
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

      @if (allSteps().length === 0) {
        <app-error-state
          data-testid="steps-empty"
          message="No instructions listed for this recipe."
        />
      } @else {
        <div data-testid="steps-content" class="flex flex-col gap-8">
          @for (group of stepGroups(); track group.component.id) {
            <div data-testid="steps-group" class="flex flex-col gap-4">
              @if (stepGroups().length > 1) {
                <h3
                  data-testid="steps-component-title"
                  class="font-serif text-xl font-semibold text-gray-900"
                >
                  {{ group.component.title }}
                </h3>
              }

              <ol class="flex flex-col gap-4">
                @for (step of group.steps; track step.id; let i = $index) {
                  <app-recipe-step-item [step]="step" [stepIndex]="group.startIndex + i" />
                }
              </ol>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RecipeStepsComponent {
  readonly variant = input.required<Variant>();

  protected readonly stepGroups = computed(() => {
    let startIndex = 0;
    const components = this.variant().components;
    return components
      .map((component) => {
        const steps = component.steps;
        const group = {
          component,
          steps,
          startIndex,
        };
        startIndex += steps.length;
        return group;
      })
      .filter((g) => g.steps.length > 0);
  });

  protected readonly allSteps = computed(() => {
    return this.variant().components.flatMap((c) => c.steps);
  });
}
