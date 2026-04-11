import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertCircle, lucideFileX, lucideServerOff } from "@ng-icons/lucide";

export type ErrorStateIcon = "alert" | "network" | "not-found";

@Component({
  selector: "app-error-state",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  viewProviders: [provideIcons({ lucideAlertCircle, lucideServerOff, lucideFileX })],
  template: `
    <div class="flex items-center justify-center py-12 px-4">
      <div class="flex items-start gap-6 max-w-lg">
        <!-- Icon -->
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50">
          <ng-icon [name]="iconMap[icon()]" class="text-2xl text-teal-600" />
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-2">
          <!-- Header -->
          <h3 class="font-serif text-xl font-semibold text-gray-800">{{ message() }}</h3>

          <!-- Subtext -->
          @if (subtext()) {
            <p data-testid="error-state-subtext" class="font-sans text-sm text-gray-500 leading-relaxed max-w-xs">
              {{ subtext() }}
            </p>
          }

          <!-- Detail -->
          @if (detail()) {
            <pre
              data-testid="error-state-detail"
              class="mt-1 bg-gray-100 rounded-md p-3 font-mono text-xs text-gray-600 text-left whitespace-pre-wrap break-all"
            >{{ detail() }}</pre>
          }
        </div>
      </div>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly subtext = input<string | null>(null);
  readonly detail = input<string | null>(null);
  readonly icon = input<ErrorStateIcon>("alert");

  protected readonly iconMap: Record<ErrorStateIcon, string> = {
    alert: "lucideAlertCircle",
    network: "lucideServerOff",
    "not-found": "lucideFileX",
  };
}
