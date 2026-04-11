import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-error-state",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p data-testid="error-state-message" class="font-sans text-base text-gray-500">{{ message() }}</p>
    @if (detail()) {
      <p data-testid="error-state-detail" class="mt-1 font-sans text-sm text-gray-400">{{ detail() }}</p>
    }
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly detail = input<string | null>(null);
}
