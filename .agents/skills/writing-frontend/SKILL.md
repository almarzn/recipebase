---
name: writing-frontend
description: Use when writing or modifying Angular frontend code, components, services, or route configurations in the frontend/ directory
license: MIT
metadata:
  language: typescript
  framework: angular
---

## Overview

This project uses Angular 21 with signals, Zard UI, and Tailwind CSS 4. Code is organized into three focused skills:

| Skill | Covers |
|-------|--------|
| **writing-presentation** | Components, templates, Zard UI, inputs/outputs, styling |
| **writing-app-state** | View-model pattern, signals, computed, action methods |
| **writing-data-fetching** | `httpResource` (reads), `HttpClient` (writes), loading/error state |

## Architecture

```
src/app/
  features/
    recipes/
      recipes.routes.ts          # lazy-loaded routes
      recipe-list/
        recipe-list.component.ts # thin component, injects view-model
        recipe-list.vm.ts        # view-model: signals, computed, actions
      recipe-detail/
        recipe-detail.component.ts
        recipe-detail.vm.ts
  shared/
    ui/                          # reusable presentational components
    services/                    # cross-feature services
    models/                      # shared TypeScript types/interfaces
```

- Feature routes are lazy-loaded.
- Each feature directory is self-contained.
- `shared/` holds cross-cutting concerns only.

## TypeScript rules

- Strict mode is on — no `any`, no implicit `any`.
- Use `unknown` for truly uncertain types, narrow with type guards.
- Prefer type inference when obvious: `const name = signal('')` infers `WritableSignal<string>`.
- Define interfaces/types in `shared/models/` or co-located with the feature.
- Use `readonly` for signal declarations: `protected readonly mySignal = signal(0)`.

## What NOT to do

- No RxJS (`Observable`, `Subject`, `pipe`, `subscribe`, `async` pipe) — signals only. Exceptions: `firstValueFrom` in services for `HttpClient`, `toSignal` + `ActivatedRoute.paramMap` for route params.
- No NgModules — standalone components only.
- No `zone.js` patterns — no `NgZone`, no manual `detectChanges()`.
- No `@Input()`, `@Output()`, `@HostBinding`, `@HostListener` decorators.
- No `*ngIf`, `*ngFor`, `*ngSwitch` structural directives.
- No `ngClass`, `ngStyle` directives.
- No unit tests unless explicitly asked.
- No `standalone: true` in decorators.
- No global state management libraries (NgRx, Akita, Elf).

## Common rationalizations

| Excuse | Reality                                                                           |
|--------|-----------------------------------------------------------------------------------|
| "RxJS is simpler here" | Use signals. Exception: `firstValueFrom` in services, `toSignal` for route params. |
| "An NgModule would organize this better" | Standalone components only. Lazy-load routes instead.                             |
| "I need `standalone: true`" | Default in Angular 20+. Never add it.                                             |
| "A global store would solve this" | Use root-scoped view-model with signals, or route params.                         |
| "This logic belongs in the component" | Move to view-model. Components are thin shells.                                   |

## Commands

```bash
cd frontend
npx ng serve            # dev server
npx ng build            # production build
npx zard-cli add button # add Zard UI component
npx ng lint             # lint (if configured)
```

## Setup

`app.config.ts` must include:

```typescript
provideHttpClient(withFetch())
```
