# Interactive Recipe Timer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- []`) syntax for tracking.

**Goal:** Replace the static timer badge in recipe steps with an interactive countdown timer component that supports start/pause/reset and plays a sound on completion.

**Architecture:** Standalone presentational component with internal signal-based state. Uses `setInterval(1000)` for countdown ticking. No view-model needed — internal UI state only (idle/running/paused/done).

**Tech Stack:** Angular 21, signals, Tailwind CSS 4, Temporal API

---

## Files

| Action | File | Purpose |
|--------|------|---------|
| Create | `frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts` | Interactive timer component |
| Modify | `frontend/src/app/features/recipes/recipe-detail/recipe-step-item.component.ts` | Replace static badge with `<app-recipe-timer>` |

---

### Task 1: Create `RecipeTimerComponent`

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts`

- [ ] **Step 1: Create the component file with full implementation**

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  signal,
} from "@angular/core";

type TimerState = "idle" | "running" | "paused" | "done";

function parseDurationMs(iso: string): number {
  const d = Temporal.Duration.from(iso);
  return (
    (d.hours ?? 0) * 3600_000 +
    (d.minutes ?? 0) * 60_000 +
    (d.seconds ?? 0) * 1000
  );
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
    // Initialize totalMs from duration input once Angular resolves it
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
    // Do nothing when done — user must reset first
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
    this.totalMs = parseDurationMs(this.duration());
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
    } catch {
      // AudioContext may not be available — silently ignore
    }
  }
}
```

- [ ] **Step 2: Format and lint**

Run: `npx @biomejs/biome check --write frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts
git commit -m "feat: add interactive recipe timer component"
```

---

### Task 2: Integrate timer into recipe step item

**Files:**
- Modify: `frontend/src/app/features/recipes/recipe-detail/recipe-step-item.component.ts`

- [ ] **Step 1: Import `RecipeTimerComponent` and replace static badge**

Replace the existing timer display block (lines 35-44) with the new component:

```typescript
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
        <p data-testid="step-text" class="font-sans text-base text-gray-900 leading-relaxed">
          {{ step().text }}
        </p>

        @if (step().notes) {
          <p data-testid="step-notes" class="font-sans text-sm text-gray-500 italic">
            {{ step().notes }}
          </p>
        }

        @if (step().attachment) {
          <app-recipe-timer [duration]="step().attachment!.duration" />
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
```

Key changes:
- Remove `formatDuration` import (no longer needed here)
- Add `RecipeTimerComponent` import
- Add `imports: [RecipeTimerComponent]` to decorator
- Replace static timer `<div>` with `<app-recipe-timer [duration]="...">`

- [ ] **Step 2: Format and lint**

Run: `npx @biomejs/biome check --write frontend/src/app/features/recipes/recipe-detail/recipe-step-item.component.ts`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/recipes/recipe-detail/recipe-step-item.component.ts
git commit -m "feat: integrate interactive timer into recipe steps"
```

---

### Task 3: Verify build

- [ ] **Step 1: Run frontend build**

Run: `cd frontend && npx ng build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run Biome on all modified files**

Run: `cd frontend && npx @biomejs/biome check --write src/app/features/recipes/recipe-detail/`
Expected: No warnings or errors
