import { ChangeDetectionStrategy, Component, computed, input, type OnDestroy, signal } from "@angular/core";

type TimerState = "idle" | "running" | "paused" | "done";

function parseDurationMs(iso: string): number {
  const d = Temporal.Duration.from(iso);
  return (d.hours ?? 0) * 3600_000 + (d.minutes ?? 0) * 60_000 + (d.seconds ?? 0) * 1000;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

@Component({
  selector: "app-recipe-timer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="step-timer" class="flex items-center gap-2">
      <button
        data-testid="timer-toggle"
        (click)="toggle()"
        class="flex items-center gap-2 py-2 px-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer transition-colors hover:bg-orange-100"
        [class.animate-pulse]="state() === 'done'"
        [class.bg-orange-100]="state() === 'running'"
        [class.border-orange-400]="state() === 'running'"
        [class.bg-red-50]="state() === 'done'"
        [class.border-red-300]="state() === 'done'"
      >
        <span class="font-sans text-sm font-medium text-orange-700">
          @if (state() === 'running') {
            ⏱
          } @else {
            ▶
          }
          {{ displayTime() }}
        </span>
      </button>
      @if (state() === 'paused' || state() === 'done') {
        <button
          data-testid="timer-reset"
          (click)="reset()"
          class="py-2 px-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100 font-sans text-sm text-gray-500"
        >
          ↺
        </button>
      }
    </div>
  `,
})
export class RecipeTimerComponent implements OnDestroy {
  readonly duration = input.required<string>();

  protected readonly state = signal<TimerState>("idle");
  protected readonly remainingMs = signal(0);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private totalMs = 0;

  protected readonly displayTime = computed(() => {
    if (this.state() === "idle") {
      return formatMs(this.totalMs);
    }
    return formatMs(this.remainingMs());
  });

  constructor() {
    queueMicrotask(() => {
      this.totalMs = parseDurationMs(this.duration());
      this.remainingMs.set(this.totalMs);
    });
  }

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
    this.intervalId = setInterval(() => {
      const remaining = this.remainingMs() - 1000;
      if (remaining <= 0) {
        this.remainingMs.set(0);
        this.clearInterval();
        this.state.set("done");
        this.playCompletionSound();
      } else {
        this.remainingMs.set(remaining);
      }
    }, 1000);
  }

  private pause(): void {
    this.clearInterval();
    this.state.set("paused");
  }

  reset(): void {
    this.clearInterval();
    this.remainingMs.set(this.totalMs);
    this.state.set("idle");
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
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
