---
name: writing-frontend
description: Angular frontend conventions — signals, Zard UI, view-model pattern, feature-splitted architecture
license: MIT
metadata:
  language: typescript
  framework: angular
---

## Architecture

### Feature-splitted structure

Every feature lives in its own directory under `src/app/features/`. Each feature is split into **presentation** (dumb components) and a **view-model** (state + logic).

```
src/app/
  features/
    recipes/
      recipes.routes.ts          # lazy-loaded routes for this feature
      recipe-list/
        recipe-list.component.ts # thin component, injects view-model
        recipe-list.vm.ts        # view-model: signals, computed, actions
      recipe-detail/
        recipe-detail.component.ts
        recipe-detail.vm.ts
  shared/
    ui/                          # reusable presentational components (if any)
    services/                    # cross-feature services
    models/                      # shared TypeScript types/interfaces
```

- Feature routes are lazy-loaded: `loadComponent: () => import('./features/recipes/recipes.routes').then(m => m.ROUTES)`
- Each feature directory is self-contained — components, view-models, and feature-specific types live together.
- `shared/` holds cross-cutting concerns only.

### Component types

**Presentational (dumb) components** — the only kind you write:
- Receive data via `input()`, emit events via `output()`, or own a view-model.
- No direct HTTP calls, no business logic in the component class.
- Template-only concerns: layout, bindings, event forwarding.

**Feature components** — thin shell that instantiates a view-model:
```typescript
@Component({
  selector: 'app-recipe-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm.loading()) {
      <z-skeleton class="h-8 w-full" />
    } @else if (vm.error()) {
      <z-alert zType="destructive">{{ vm.error() }}</z-alert>
    } @else {
      @for (recipe of vm.recipes(); track recipe.id) {
        <z-card>
          <z-card-header>
            <z-card-title>{{ recipe.name }}</z-card-title>
          </z-card-header>
        </z-card>
      }
    }
  `,
  imports: [ZardCardComponent, ZardCardHeaderComponent, ZardCardTitleComponent, ZardSkeletonComponent, ZardAlertComponent],
})
export class RecipeListComponent {
  protected readonly vm = inject(RecipeListViewModel);
}
```

The component class is ~3 lines. All state and logic lives in the view-model.

## View-Model pattern

### Structure

A view-model is an `@Injectable` class that holds:
1. **Signals** for mutable state (private writable, exposed as readonly).
2. **Computed signals** for derived state.
3. **Action methods** that update state and trigger side effects.
4. **Data-fetching state**: `loading`, `error`, `data` — always explicit.

```typescript
@Injectable()
export class RecipeListViewModel {
  private readonly recipeService = inject(RecipeService);

  private readonly _recipes = signal<Recipe[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly recipes = this._recipes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasRecipes = computed(() => this._recipes().length > 0);
  readonly recipeCount = computed(() => this._recipes().length);

  constructor() {
    this.loadRecipes();
  }

  async loadRecipes(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const recipes = await this.recipeService.getAll();
      this._recipes.set(recipes);
    } catch (e) {
      this._error.set(e instanceof Error ? e.message : 'Failed to load recipes');
    } finally {
      this._loading.set(false);
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.recipeService.delete(id);
    this._recipes.update(recipes => recipes.filter(r => r.id !== id));
  }
}
```

### Rules

- View-models are `@Injectable()` with no `providedIn` — provide them at the component level via `providers: [RecipeListViewModel]` or `viewProviders`.
- Every view-model that fetches data must expose `loading`, `error`, and the data signal. The template must handle all three states.
- Use `signal.set()` for replacing values, `signal.update()` for transforming. Never use `signal.mutate()`.
- Prefer `computed()` over manual derivation in methods.
- Constructor can trigger initial data load. For parameterized loads, use a method the component calls after inputs resolve.

## Signals — always

- **All state is signals.** No plain class properties for template-bound state.
- `signal<T>(initialValue)` for writable state.
- `computed(() => expr)` for derived state.
- `effect(() => { ... })` for side effects (rare — prefer explicit action methods).
- Read with `mySignal()`, write with `.set()` or `.update()`.
- **Never RxJS** in new code. No `Observable`, `Subject`, `BehaviorSubject`, `async pipe`, `subscribe()`.
- **Never zone.js patterns.** No `NgZone.run()`, no manual change detection. Rely on signals + `OnPush`.

## Data fetching

### HTTP client

Use Angular's `HttpClient` with `fetch` backend:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    // ...
  ],
};
```

### Service layer

Services are thin wrappers around `HttpClient`. They return promises or direct values, never Observables.

```typescript
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/recipes';

  async getAll(): Promise<Recipe[]> {
    return firstValueFrom(this.http.get<Recipe[]>(this.baseUrl));
  }

  async getById(id: string): Promise<Recipe> {
    return firstValueFrom(this.http.get<Recipe>(`${this.baseUrl}/${id}`));
  }

  async create(data: CreateRecipeRequest): Promise<Recipe> {
    return firstValueFrom(this.http.post<Recipe>(this.baseUrl, data));
  }

  async update(id: string, data: UpdateRecipeRequest): Promise<Recipe> {
    return firstValueFrom(this.http.put<Recipe>(`${this.baseUrl}/${id}`, data));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
```

- Use `firstValueFrom()` to convert Observables to Promises.
- The only place RxJS is acceptable: wrapping `HttpClient` calls with `firstValueFrom`. Nothing else.

### Loading/error pattern

Every data-fetching view-model must track three states:

```typescript
private readonly _data = signal<T | null>(null);
private readonly _loading = signal(false);
private readonly _error = signal<string | null>(null);
```

Templates must render all three:

```html
@if (vm.loading()) {
  <z-skeleton />
} @else if (vm.error()) {
  <z-alert zType="destructive">{{ vm.error() }}</z-alert>
} @else {
  <!-- render vm.data() -->
}
```

## UI components — Zard UI

Use [Zard UI](https://zardui.com) components. They are installed locally via the CLI (`npx zard-cli add <component>`).

### Import pattern

Zard UI components are imported directly into the component's `imports` array:

```typescript
import { ZardButtonComponent } from '@/shared/ui/button.component';
import { ZardCardComponent, ZardCardHeaderComponent, ZardCardTitleComponent } from '@/shared/ui/card.component';
```

The exact import path depends on where `zard-cli` places them (typically `src/shared/ui/`). Adjust to match actual file locations.

### Usage conventions

- Use attribute selectors: `<button z-button zType="outline">`, `<z-card>`, `<z-input>`.
- Pass variants as attributes: `zType`, `zSize`, `zShape`.
- Combine with Tailwind utility classes for spacing/layout: `<z-card class="mt-4 p-2">`.
- Use `zDisabled`, `zLoading` for interactive states.

### Common components reference

| Component | Selector | Common attributes |
|-----------|----------|-------------------|
| Button | `button[z-button]` | `zType`, `zSize`, `zDisabled`, `zLoading` |
| Input | `input[z-input]` | `zSize`, `zError` |
| Card | `z-card` | `class` for styling |
| Alert | `z-alert` | `zType` |
| Skeleton | `z-skeleton` | `class` for sizing |
| Dialog | `z-dialog` | programmatic via service |
| Tabs | `z-tabs` | `z-tabs-list`, `z-tab-trigger`, `z-tab-content` |
| Select | `z-select` | `z-select-trigger`, `z-select-content`, `z-select-item` |
| Badge | `z-badge` | `zType`, `zSize` |

When in doubt about a component's API, fetch its docs page at `https://zardui.com/docs/components/<component-name>`.

## Component conventions

### Decorator config

```typescript
@Component({
  selector: 'app-my-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [/* Zard components, other standalone components */],
  providers: [MyFeatureViewModel],
  template: `...`,
})
```

- Always set `changeDetection: ChangeDetectionStrategy.OnPush`.
- Never set `standalone: true` (default in Angular 20+).
- Use inline `template` for all components. Only use `templateUrl` for very large templates (>80 lines).
- Use `styleUrl` or inline `styles` sparingly — prefer Tailwind utility classes.

### Inputs and outputs

- Use `input()` function, not `@Input()` decorator.
- Use `output()` function, not `@Output()` decorator.
- Use `input.required<T>()` for required inputs.
- Use `model()` for two-way binding.

```typescript
export class RecipeCardComponent {
  readonly recipe = input.required<Recipe>();
  readonly selected = input(false);
  readonly deleted = output<string>();
}
```

### Dependency injection

- Use `inject()` function, never constructor injection.
- Prefer `inject()` at the class field level for readability.

```typescript
export class MyComponent {
  private readonly vm = inject(MyViewModel);
  private readonly router = inject(Router);
}
```

### Host bindings

- Use the `host` object in `@Component`, never `@HostBinding`/`@HostListener`.
- Bind events with `host: { '(click)': 'onClick()' }`.

### Template rules

- Native control flow only: `@if`, `@for`, `@switch`. Never `*ngIf`, `*ngFor`.
- `@for` always uses `track` expression.
- Use `class` bindings over `ngClass`. Use `style` bindings over `ngStyle`.
- Keep template expressions simple — complex logic goes in the view-model or `computed()`.
- Do not assume globals like `new Date()` — inject `DateAdapter` or pass from view-model.

## Styling

- Tailwind CSS 4 with utility classes.
- Design tokens are CSS custom properties (see `styles.css` for available variables: `--primary`, `--background`, `--foreground`, etc.).
- Use `class="..."` for static classes, `[class]="dynamicClass()"` for computed classes.
- Avoid custom CSS files — if you need reusable styles, extract to a component or use Tailwind `@apply` in the component's styles.

## TypeScript rules

- Strict mode is on — no `any`, no implicit `any`.
- Use `unknown` for truly uncertain types, narrow with type guards.
- Prefer type inference when obvious: `const name = signal('')` infers `WritableSignal<string>`.
- Define interfaces/types in `shared/models/` or co-located with the feature.
- Use `readonly` for signal declarations: `protected readonly mySignal = signal(0)`.

## What NOT to do

- No RxJS (`Observable`, `Subject`, `pipe`, `subscribe`, `async` pipe) — signals only.
- No NgModules — standalone components only.
- No `zone.js` patterns — no `NgZone`, no manual `detectChanges()`.
- No `@Input()`, `@Output()`, `@HostBinding`, `@HostListener` decorators.
- No `*ngIf`, `*ngFor`, `*ngSwitch` structural directives.
- No `ngClass`, `ngStyle` directives.
- No unit tests unless explicitly asked.
- No `standalone: true` in decorators.

## Commands

```bash
cd frontend
npx ng serve            # dev server
npx ng build            # production build
npx zard-cli add button # add Zard UI component
npx ng lint             # lint (if configured)
```
