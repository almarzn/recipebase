import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { Step } from "@/shared/models";
import { RecipeTimerComponent } from "./recipe-timer.component";

const stepNumberFormat = new Intl.NumberFormat("en-US", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

@Component({
  selector: "app-recipe-step-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeTimerComponent],
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
        <p data-testid="step-body" class="font-sans text-base text-gray-900 leading-relaxed">
          {{ step().body }}
        </p>

        @if (step().timer_seconds) {
          <app-recipe-timer [timerSeconds]="step().timer_seconds!" />
        }
      </div>
    </li>
  `,
})
export class RecipeStepItemComponent {
  readonly step = input.required<Step>();
  readonly stepIndex = input.required<number>();

  protected readonly formattedNumber = computed(() => stepNumberFormat.format(this.stepIndex() + 1));
}
