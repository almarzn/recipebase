import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardCardComponent } from "@/shared/components/card";

import type { Variant } from "@/shared/models";

@Component({
  selector: "app-recipe-steps",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardCardComponent, ZardBadgeComponent],
  template: `
    <div data-testid="recipe-steps" class="flex flex-col gap-6">
      <h2 data-testid="steps-heading" class="text-lg font-bold text-teal-800">
        Instructions
      </h2>

      @if (allSteps().length === 0) {
        <p data-testid="steps-empty" class="font-sans text-base text-gray-500">
          No instructions listed for this recipe.
        </p>
      } @else {
        <div data-testid="steps-content" class="flex flex-col gap-8">
          @for (group of stepGroups(); track group.component.id) {
            <div data-testid="steps-group" class="flex flex-col gap-4">
              <!-- Component Title (if multiple components have steps) -->
              @if (stepGroups().length > 1) {
                <h3 data-testid="steps-component-title" class="font-serif text-xl font-semibold text-gray-900">
                  {{ group.component.title }}
                </h3>
              }

              <!-- Steps List -->
              <ol class="flex flex-col gap-4">
                @for (step of group.steps; track step.id; let i = $index) {
                  <li data-testid="step-item" class="flex gap-4 items-start">
                    <!-- Step Number -->
                    <div class="flex-shrink-0">
                      <div
                        data-testid="step-number"
                        class="w-10 h-10 flex items-center justify-center font-sans text-xl font-bold text-gray-300"
                      >
                        {{ stepNumberFormat.format(group.startIndex + i + 1) }}
                      </div>
                    </div>

                    <!-- Step Content -->
                    <div class="flex flex-col gap-2 flex-1 pt-2">
                      <p data-testid="step-text" class="font-sans text-base text-gray-900 leading-relaxed">
                        {{ step.text }}
                      </p>

                      @if (step.notes) {
                        <p data-testid="step-notes" class="font-sans text-sm text-gray-500 italic">
                          {{ step.notes }}
                        </p>
                      }

                      @if (step.attachment) {
                        <div data-testid="step-timer" class="flex items-center gap-2 py-2 px-3 bg-orange-50 rounded-lg border border-orange-200">
                          <span class="font-sans text-sm font-medium text-orange-700">
                              Timer: {{ formatDuration(step.attachment.duration) }}
                            </span>
                        </div>
                      }
                    </div>
                  </li>
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

  readonly stepNumberFormat = Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  protected readonly allSteps = computed(() => {
    return this.variant().components.flatMap((c) => c.steps);
  });

  protected formatDuration(duration: string): string {
    const parsedDuration = Temporal.Duration.from(duration);

    return parsedDuration.toLocaleString(undefined, { style: "short" });
  }
}
