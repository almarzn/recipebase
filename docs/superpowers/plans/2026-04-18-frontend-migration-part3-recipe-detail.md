# Frontend Migration Part 3: Recipe Detail

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the variant layer from recipe detail. Recipe detail renders components directly — no variant switcher.

**Architecture:** `recipe-detail.vm.ts` drops all variant signals. `recipe-detail.component.ts` iterates components directly. Sub-components updated for new field names (`step.body`, `step.timer_seconds`, `quantity.value`). `recipe-variant.vm.ts` deleted. Variant route removed from `recipes.routes.ts`.

**Tech Stack:** Angular 21, `httpResource`, `computed`, Biome.

**Depends on:** Part 1 (models) must be done first.

---

**Files:**
- Delete: `frontend/src/app/features/recipes/recipe-detail/recipe-variant.vm.ts`
- Rewrite: `frontend/src/app/features/recipes/recipe-detail/recipe-detail.vm.ts`
- Rewrite: `frontend/src/app/features/recipes/recipe-detail/recipe-detail.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-detail/recipe-header.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-detail/recipe-ingredient-list.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-detail/recipe-ingredient-item.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-detail/recipe-steps.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-detail/recipe-step-item.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-detail/recipe-timer.component.ts`
- Update: `frontend/src/app/features/recipes/recipes.routes.ts`

---

- [ ] **Step 1: Read all files in `recipe-detail/`**

Read every file listed above before editing anything.

- [ ] **Step 2: Delete `recipe-variant.vm.ts`**

```bash
rm frontend/src/app/features/recipes/recipe-detail/recipe-variant.vm.ts
```

- [ ] **Step 3: Rewrite `recipe-detail.vm.ts`**

No variant signal. Load recipe by slug. Expose `recipe` resource and `components` computed signal.

```typescript
// recipe-detail.vm.ts
import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/core';
import { map } from 'rxjs/operators';
import { Recipe } from '../../../shared/models';

export class RecipeDetailViewModel {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map(p => p.get('slug')!)),
    { requireSync: true }
  );

  readonly recipe = httpResource<Recipe>(() => `/api/recipes/${this.slug()}`);

  readonly components = computed(() => this.recipe.value()?.components ?? []);

  reload() {
    this.recipe.reload();
  }
}
```

- [ ] **Step 4: Rewrite `recipe-detail.component.ts`**

Remove variant switcher. Iterate `vm.components()` directly. Preserve loading/error/404 handling from the old file.

Key template structure (adapt to match existing skeleton/error components):
```html
@if (vm.recipe.isLoading()) {
  <!-- existing skeleton markup -->
} @else if (vm.recipe.error()) {
  <!-- existing error/not-found markup -->
} @else if (vm.recipe.value(); as recipe) {
  <app-recipe-header [recipe]="recipe" />
  @for (component of vm.components(); track component.id) {
    @if (component.name) {
      <h2>{{ component.name }}</h2>
    }
    <app-recipe-ingredient-list [ingredients]="component.ingredients" />
    <app-recipe-steps [steps]="component.steps" />
  }
}
```

- [ ] **Step 5: Update `recipe-header.component.ts`**

Accept `Recipe` input. Replace:
- `recipe.title` → `recipe.name`
- `recipe.description` → remove (field gone)
- Add display of `recipe.tags` as badges (use existing badge component from `shared/components/badge`)
- Add display of `recipe.yield` if non-null: `"Yields: {yield.quantity} {yield.unit}"`

- [ ] **Step 6: Update `recipe-ingredient-item.component.ts`**

Accept `Ingredient` input. Change:
- `quantity.amount` → `quantity.value`
- Display format: `"${ingredient.quantity.value} ${ingredient.quantity.unit}"`

- [ ] **Step 7: Update `recipe-step-item.component.ts`**

Accept `Step` input. Change:
- `step.text` → `step.body`
- `step.attachment?.duration` (ISO 8601 string) → `step.timer_seconds` (number | null)
- Pass `step.timer_seconds` to timer component

- [ ] **Step 8: Update `recipe-timer.component.ts`**

Accept `timerSeconds: number | null` input instead of ISO 8601 duration string. Remove ISO 8601 parsing. Convert to display:

```typescript
get minutes(): number { return Math.floor((this.timerSeconds ?? 0) / 60); }
get seconds(): number { return (this.timerSeconds ?? 0) % 60; }
```

Show timer only when `timerSeconds` is non-null and > 0. Preserve all countdown/start/stop logic, just replace the duration source.

- [ ] **Step 9: Update `recipe-steps.component.ts`**

Update `@Input` type from old `Step[]` to new `Step[]` (field names changed). No template changes needed if it just passes steps down to `recipe-step-item`.

- [ ] **Step 10: Update `recipe-ingredient-list.component.ts`**

Update `@Input` type from old `Ingredient[]` to new `Ingredient[]`. No template changes needed if it just passes ingredients down to `recipe-ingredient-item`.

- [ ] **Step 11: Format + verify**

```bash
cd frontend && npx @biomejs/biome check --write src/app/features/recipes/recipe-detail/
npx ng build 2>&1 | grep -E "error|Error" | head -40
```

Expected: no errors.

- [ ] **Step 12: Update `recipes.routes.ts` — drop variant route**

```typescript
// frontend/src/app/features/recipes/recipes.routes.ts
import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./recipe-list/recipe-list').then(m => m.RecipeListPage),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./recipe-detail/recipe-detail.component').then(
        m => m.RecipeDetailPage
      ),
  },
  {
    path: ':slug/edit',
    loadChildren: () =>
      import('./recipe-edit/recipe-edit.routes').then(m => m.ROUTES),
  },
];
```

Remove the `variants/:variantSlug` entry.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/app/features/recipes/recipe-detail/ \
        frontend/src/app/features/recipes/recipes.routes.ts
git commit -m "feat(frontend): recipe detail — remove variant layer, render components directly"
```
