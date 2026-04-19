# Frontend Migration Part 4: Recipe Edit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove variant edit entirely. Replace with direct component CRUD (list + atomic PUT per component).

**Architecture:** Delete variant edit files. `recipe-edit.vm.ts` loads `Recipe` directly (no variant layer). Nav tabs become Info + Components. Component list (`recipe-components`) replaces `recipe-variant-components`. Component detail form sends atomic PUT with metadata + ingredients + steps in one request.

**Tech Stack:** Angular 21, `httpResource`, `HttpClient`, Signal Forms (see `angular-forms` skill), Biome.

**Depends on:** Part 1 (models) must be done first. Parts 2 and 3 can be done in parallel.

---

**Files:**
- Delete: `frontend/src/app/features/recipes/recipe-edit/recipe-edit-variant.component.ts`
- Delete: `frontend/src/app/features/recipes/recipe-edit/recipe-variant-edit.vm.ts`
- Delete: `frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-variant-components.vm.ts`
- Delete: `frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-variant-components.component.ts`
- Rewrite: `frontend/src/app/features/recipes/recipe-edit/recipe-edit.routes.ts`
- Update: `frontend/src/app/features/recipes/recipe-edit/recipe-edit.vm.ts`
- Update: `frontend/src/app/features/recipes/recipe-edit/recipe-edit-shell.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-edit/recipe-edit-nav.component.ts`
- Update: `frontend/src/app/features/recipes/recipe-edit/recipe-edit-info.vm.ts`
- Update: `frontend/src/app/features/recipes/recipe-edit/recipe-edit-info.component.ts`
- Create: `frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-components.vm.ts`
- Create: `frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-components.component.ts`
- Rewrite: `frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-component-detail.component.ts`

---

- [ ] **Step 1: Read all files in `recipe-edit/`**

Read every file listed above before editing anything. Pay attention to how `RecipeEditViewModel` is currently provided/injected in the shell.

- [ ] **Step 2: Delete variant edit files**

```bash
rm frontend/src/app/features/recipes/recipe-edit/recipe-edit-variant.component.ts
rm frontend/src/app/features/recipes/recipe-edit/recipe-variant-edit.vm.ts
rm frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-variant-components.vm.ts
rm frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-variant-components.component.ts
```

- [ ] **Step 3: Rewrite `recipe-edit.routes.ts`**

Drop all variant routes. Add `components` and `components/:componentSlug` children.

```typescript
// frontend/src/app/features/recipes/recipe-edit/recipe-edit.routes.ts
import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./recipe-edit-shell.component').then(m => m.RecipeEditShellComponent),
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      {
        path: 'info',
        loadComponent: () =>
          import('./recipe-edit-info.component').then(m => m.RecipeEditInfoComponent),
      },
      {
        path: 'components',
        loadComponent: () =>
          import('./variant-components/recipe-components.component').then(
            m => m.RecipeComponentsComponent
          ),
      },
      {
        path: 'components/:componentSlug',
        loadComponent: () =>
          import('./variant-components/recipe-component-detail.component').then(
            m => m.RecipeComponentDetailComponent
          ),
      },
    ],
  },
];
```

- [ ] **Step 4: Update `recipe-edit.vm.ts`**

Remove all variant-related signals and methods. Load `Recipe` directly. Keep `slug` signal and `reload()`.

```typescript
// recipe-edit.vm.ts — key parts
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/core';
import { map } from 'rxjs/operators';
import { Recipe } from '../../../shared/models';

export class RecipeEditViewModel {
  private readonly route = inject(ActivatedRoute);

  readonly slug = toSignal(
    this.route.paramMap.pipe(map(p => p.get('slug')!)),
    { requireSync: true }
  );

  readonly recipe = httpResource<Recipe>(() => `/api/recipes/${this.slug()}`);

  reload() {
    this.recipe.reload();
  }
}
```

- [ ] **Step 5: Update `recipe-edit-shell.component.ts`**

Remove all variant-related code. Shell provides `RecipeEditViewModel` and renders `<router-outlet>`. No variant-specific template logic.

- [ ] **Step 6: Update `recipe-edit-nav.component.ts`**

Replace variant tab with Components tab. Result: two tabs only.

Navigation tabs:
- `Info` → routerLink `./info`
- `Components` → routerLink `./components`

Remove any `variants` or `variantSlug` routing logic.

- [ ] **Step 7: Update `recipe-edit-info.vm.ts`**

Change HTTP method from `PATCH` to `PUT`. Change request body field from `title` to `name`.

```typescript
// recipe-edit-info.vm.ts — submit method
interface RecipeInfoFormData { name: string; }

async submit(data: RecipeInfoFormData): Promise<void> {
  await firstValueFrom(
    this.http.put(`/api/recipes/${this.editVm.slug()}`, {
      name: data.name,
    })
  );
  this.editVm.reload();
}
```

- [ ] **Step 8: Update `recipe-edit-info.component.ts`**

Form field label: "Name" (was "Title"). Bind to `name` field. Pre-populate from `editVm.recipe.value()?.name`.

- [ ] **Step 9: Create `variant-components/recipe-components.vm.ts`**

```typescript
// frontend/src/app/features/recipes/recipe-edit/variant-components/recipe-components.vm.ts
import { inject } from '@angular/core';
import { httpResource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Component } from '../../../../shared/models';
import { RecipeEditViewModel } from '../recipe-edit.vm';

export class RecipeComponentsViewModel {
  private readonly http = inject(HttpClient);
  readonly editVm = inject(RecipeEditViewModel);

  readonly components = httpResource<Component[]>(
    () => `/api/recipes/${this.editVm.slug()}/components`
  );

  async addComponent(): Promise<void> {
    const position = (this.components.value()?.length ?? 0) + 1;
    await firstValueFrom(
      this.http.post(`/api/recipes/${this.editVm.slug()}/components`, {
        slug: `component-${position}`,
        name: null,
        position,
        ingredients: [],
        steps: [],
      })
    );
    this.components.reload();
  }

  async deleteComponent(componentSlug: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `/api/recipes/${this.editVm.slug()}/components/${componentSlug}`
      )
    );
    this.components.reload();
  }
}
```

- [ ] **Step 10: Create `variant-components/recipe-components.component.ts`**

List components with add and delete actions. Navigate to component detail on click.

```typescript
// Key template structure:
// - "Add Component" button → calls vm.addComponent(), then router.navigate(['../components', newSlug], {relativeTo: route})
// - For each component: show name ?? '(main)', link to [../components, component.slug], delete button
// - Loading/error states for vm.components
```

Full template:
```html
<div>
  @if (vm.components.isLoading()) {
    <app-loader />
  } @else if (vm.components.error()) {
    <app-error-state message="Failed to load components" />
  } @else {
    @for (component of vm.components.value() ?? []; track component.id) {
      <div>
        <a [routerLink]="['../components', component.slug]">
          {{ component.name ?? '(main)' }}
        </a>
        <button (click)="vm.deleteComponent(component.slug)">Delete</button>
      </div>
    }
    <button (click)="vm.addComponent()">Add Component</button>
  }
</div>
```

- [ ] **Step 11: Rewrite `variant-components/recipe-component-detail.component.ts`**

Form to edit a single component atomically. Loads component data from the parent recipe. On submit, sends PUT with full component state.

Read `componentSlug` from route params. Find component in `editVm.recipe.value()?.components`.

Form fields:
- `name` (optional text input)
- Ingredients list (add/remove rows): each row has `name`, `quantityValue` (number), `quantityUnit` (text), `notes` (optional)
- Steps list (add/remove rows): each row has `body` (textarea), `timer_seconds` (optional number)

Submit handler:
```typescript
async submit(): Promise<void> {
  const slug = this.componentSlug();
  await firstValueFrom(
    this.http.put(
      `/api/recipes/${this.editVm.slug()}/components/${slug}`,
      {
        name: this.form.name || null,
        position: this.component()!.position,
        ingredients: this.form.ingredients.map((ing, idx) => ({
          slug: slugify(ing.name),
          name: ing.name,
          quantity: { value: ing.quantityValue, unit: ing.quantityUnit },
          notes: ing.notes || null,
          position: idx + 1,
        })),
        steps: this.form.steps.map((step, idx) => ({
          slug: slugify(step.body),
          body: step.body,
          timer_seconds: step.timerSeconds ?? null,
          order: idx + 1,
        })),
      }
    )
  );
  this.editVm.reload();
  this.router.navigate(['../..'], { relativeTo: this.route });
}
```

Slug utility (inline in this file):
```typescript
function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
```

Use Angular Signal Forms (load `angular-forms` skill before implementing).

- [ ] **Step 12: Format + verify**

```bash
cd frontend && npx @biomejs/biome check --write src/app/features/recipes/recipe-edit/
npx ng build 2>&1 | grep -E "error|Error" | head -40
```

Expected: no errors.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/app/features/recipes/recipe-edit/
git commit -m "feat(frontend): recipe edit — drop variant layer, add component CRUD"
```
