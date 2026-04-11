# Interactive Recipe Timer Component

## Overview

Convert the static timer badge in recipe steps into an interactive countdown timer component. Currently, steps with a `TimerAttachment` show a static formatted duration (e.g., "12 min"). The new component allows users to start, pause, and reset a countdown directly from the recipe step view.

## Requirements

- **Start/Pause toggle**: Tap the time badge to start or pause the countdown
- **Reset**: Secondary button appears when timer has progress to clear
- **Visual alert + sound**: On completion, badge pulses and plays a short beep
- **Standalone component**: Extracted from `recipe-step-item` for reusability

## Approach

Signal-based countdown using `setInterval(1000)`. Matches existing project patterns (signals, computed, `OnPush` change detection).

## UI States

```
[ ▶ 12:00 ]           ← idle (tap to start)
[ ⏱ 11:34 ]           ← running (tap to pause, time counts down)
[ ▶ 11:34 ] [ ↺ ]     ← paused (tap to resume, reset extends right)
[ ⏱ 00:00 ] [ ↺ ]     ← done (pulses, tap does nothing, reset to restart)
```

The time badge itself is the interactive button. The icon (▶/⏱) indicates current state. Reset appears as a small button to the right when paused or done.

## Component: `RecipeTimerComponent`

**File:** `frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts`

**Inputs:**
- `duration` — ISO 8601 duration string (e.g., `"PT12M"`)

**Internal State (signals):**
- `remainingMs` — milliseconds remaining (initialized from duration)
- `state` — `"idle" | "running" | "paused" | "done"`
- `displayTime` — computed, formatted `MM:SS` from `remainingMs`

**Methods:**
- `toggle()` — if idle/paused → start; if running → pause
- `start()` — sets state to `"running"`, starts `setInterval` ticking down `remainingMs`
- `pause()` — clears interval, sets state to `"paused"`
- `reset()` — clears interval, resets `remainingMs` to original duration, state → `"idle"`
- On `remainingMs` hits 0: state → `"done"`, clears interval, triggers completion

**Completion:**
- Visual: badge pulses/flashes orange-red animation
- Sound: one-time short beep via `AudioContext` oscillator (no asset file needed)

## Files

| Action | File |
|--------|------|
| Create | `frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts` |
| Modify | `frontend/src/app/features/recipes/recipe-detail/recipe-step-item.component.ts` — replace static badge with `<app-recipe-timer>` |

## Integration

In `recipe-step-item.component.ts`, replace:

```html
@if (step().attachment) {
  <div data-testid="step-timer" ...>
    <span>Timer: {{ formatDuration(step().attachment!.duration) }}</span>
  </div>
}
```

With:

```html
@if (step().attachment) {
  <app-recipe-timer [duration]="step().attachment!.duration" />
}
```
