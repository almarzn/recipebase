import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  type OnDestroy,
  signal,
} from "@angular/core";
import { Temporal } from "@js-temporal/polyfill";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePause, lucidePlay, lucideRotateCcw } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button/button.component";

type TimerState = "idle" | "running" | "paused" | "done";

const timerFormat = new Intl.DurationFormat(undefined, { style: "digital" });

function formatDuration(duration: Temporal.Duration): string {
  const parts = timerFormat.formatToParts(duration.round({ smallestUnit: "seconds", largestUnit: "hours" }));

  const minuteIndex = parts.findIndex((part) => part.unit === "minute");
  const firstNonZeroPart = parts.findIndex((part) => part.type !== "literal" && Number(part.value) > 0);

  const startIndex = Math.min(minuteIndex, Math.max(minuteIndex + 1, firstNonZeroPart));

  return parts
    .slice(startIndex)
    .map((it) => it.value)
    .join("");
}

@Component({
  selector: "app-recipe-timer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent],
  viewProviders: [provideIcons({ lucidePlay, lucidePause, lucideRotateCcw })],
  template: `
    <div data-testid="step-timer" class="flex items-center gap-2">
      <button
        data-testid="timer-toggle"
        z-button
        zType="outline"
        zSize="sm"
        (click)="toggle()"
        zShape="circle"
        class="flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700"
        [class.animate-pulse]="state() === 'done'"
        [class.bg-orange-100]="state() === 'running'"
        [class.border-orange-400]="state() === 'running'"
        [class.bg-red-500]="state() === 'done'"
        [class.border-red-500]="state() === 'done'"
        [class.text-white]="state() === 'done'"
        [class.hover:bg-orange-200]="state() !== 'done'"
      >
        @if (state() === 'running') {
          <ng-icon name="lucidePause"/>
        } @else {
          <ng-icon name="lucidePlay"/>
        }
        <span class="font-sans text-sm font-medium">{{ displayTime() }}</span>
      </button>
      @if (state() === 'paused' || state() === 'done') {
        <button
          data-testid="timer-reset"
          z-button
          zType="ghost"
          zSize="icon-sm"
          (click)="reset()"
        >
          <ng-icon name="lucideRotateCcw"/>
        </button>
      }
    </div>
  `,
})
export class RecipeTimerComponent implements OnDestroy {
  readonly duration = input.required<string>();

  protected readonly state = signal<TimerState>("idle");

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private deadline: Temporal.Instant | null = null;

  protected readonly remainingTime = linkedSignal(() => Temporal.Duration.from(this.duration()));
  protected readonly displayTime = computed(() => formatDuration(this.remainingTime()));

  ngOnDestroy(): void {
    this.clearInterval();
  }

  toggle(): void {
    if (this.state() === "idle" || this.state() === "paused") {
      this.start();
    } else if (this.state() === "running") {
      this.pause();
    }
  }

  private start(): void {
    this.state.set("running");
    this.deadline = Temporal.Now.instant().add(this.remainingTime());
    this.intervalId = setInterval(() => {
      if (!this.deadline) return;
      this.updateCountdown();
    }, 500);
  }

  private pause(): void {
    this.updateCountdown();
    this.clearInterval();
    this.state.set("paused");
  }

  private updateCountdown() {
    this.remainingTime.update((it) => this.deadline?.since(Temporal.Now.instant()) ?? it);

    if (!this.deadline) return;

    const remaining = this.deadline.since(Temporal.Now.instant());

    if (remaining.sign <= 0) {
      this.clearInterval();
      this.state.set("done");
      this.playCompletionSound();
    }
  }

  reset(): void {
    this.clearInterval();
    this.remainingTime.set(Temporal.Duration.from(this.duration()));
    this.state.set("idle");
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.deadline = null;
  }

  private playCompletionSound(): void {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
      osc.onended = () => ctx.close();
    } catch {
      // AudioContext may not be available — silently ignore
    }
  }
}
