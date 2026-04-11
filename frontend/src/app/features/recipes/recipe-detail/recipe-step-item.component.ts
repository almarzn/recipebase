import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { Step } from "@/shared/models";
import { formatDuration } from "@/shared/utils";

const stepNumberFormat = new Intl.NumberFormat("en-US", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

@Component({
  selector: "app-recipe-step-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li data-testid="step-item" class="flex gap-4 items-start">
      <div class="flex-shrink-0">
        <div
          data-testid="step-number"
          class="w-10 h-10 flex items-center justify-center font-sans text-xl font-bold text-gray-300"
        >
          {{ formattedNumber() }}
        </div>
      </div>

      <div class="flex flex-col gap-2 flex-1 pt-2">
        <p data-testid="step-text" class="font-sans text-base text-gray-900 leading-relaxed">
          {{ step().text }}
        </p>

        @if (step().notes) {
          <p data-testid="step-notes" class="font-sans text-sm text-gray-500 italic">
            {{ step().notes }}
          </p>
        }

        @if (step().attachment) {
          <div
            data-testid="step-timer"
            class="flex items-center gap-2 py-2 px-3 bg-orange-50 rounded-lg border border-orange-200"
          >
            <span class="font-sans text-sm font-medium text-orange-700">
              Timer: {{ formatDuration(step().attachment!.duration) }}
            </span>
          </div>
        }
      </div>
    </li>
  `,
})
export class RecipeStepItemComponent {
  readonly step = input.required<Step>();
  readonly stepIndex = input.required<number>();

  protected readonly formattedNumber = computed(() => stepNumberFormat.format(this.stepIndex() + 1));
  protected readonly formatDuration = formatDuration;
}
