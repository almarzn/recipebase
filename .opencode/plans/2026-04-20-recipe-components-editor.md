# Recipe Components Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the read-only components list with an inline editor for the first component — validate the ingredient and step editing experience before expanding to all components.

**Architecture:** Two VMs (parent `RecipeComponentsViewModel` per page + sub `RecipeComponentEditorViewModel` per component for upgradability), with deeply split presentational components:

```
RecipeComponentsComponent (page)
  └── RecipeComponentEditorComponent (editor container)
       ├── ComponentEditorIngredientListComponent (ingredient list)
       │    └── EditorIngredientComponent (individual row)
       └── ComponentEditorStepsListComponent (step list)
            └── EditorStepComponent (individual row)
```

Direct inline editing — no accordion, no read-only preview, no navigation to detail.

**Scope:** Single component (the first one). Title/description always null. Full ingredient editing (name, quantity, notes). Basic step editing (body text). Add/delete for both. Save button (wired to console.log for now).

**Tech Stack:** Angular 21, Zard UI, Tailwind CSS 4, TypeScript, Signals, Signal Forms, Playwright (E2E)

---

## File Structure Map

### Files to Create
- `frontend/src/app/features/recipes/recipe-edit/components/recipe-component-editor.vm.ts` — Sub-VM for per-component editing state
- `frontend/src/app/features/recipes/recipe-edit/components/editor-ingredient.component.ts` — Single ingredient row (presentational)
- `frontend/src/app/features/recipes/recipe-edit/components/component-editor-ingredient-list.component.ts` — Ingredient list container (presentational)
- `frontend/src/app/features/recipes/recipe-edit/components/editor-step.component.ts` — Single step row (presentational)
- `frontend/src/app/features/recipes/recipe-edit/components/component-editor-steps-list.component.ts` — Step list container (presentational)
- `frontend/src/app/features/recipes/recipe-edit/components/recipe-component-editor.component.ts` — Editor container (thin, delegates to sub-components)
- `frontend/src/app/features/recipes/recipe-edit/components/recipe-components.vm.ts` — Parent VM
- `frontend/src/app/features/recipes/recipe-edit/components/recipe-components.component.ts` — Parent page component
- `frontend/e2e/recipes/recipe-components.po.ts` — Page object for components editor
- `frontend/e2e/recipes/recipe-components.spec.ts` — Integration tests

### Files to Modify
- `frontend/src/app/features/recipes/recipe-edit/recipe-edit.routes.ts` — Update imports, remove detail route
- `frontend/e2e/recipes/recipe-edit.spec.ts` — Update mock data and assertions to match new editor

### Files to Delete
- `frontend/src/app/features/recipes/recipe-edit/variant-components/` directory (4 files)
- `frontend/src/app/features/recipes/recipe-edit/variant-components/component-edit/` directory (empty)

---

## Task 1: Create Directory Structure

**Goal:** Create the `components/` directory for new files.

**Commands:**

- [ ] **Step 1: Create directory**

```bash
mkdir -p /home/almar/projects/recipebase/frontend/src/app/features/recipes/recipe-edit/components
```

- [ ] **Step 2: Verify directory exists**

```bash
ls -d /home/almar/projects/recipebase/frontend/src/app/features/recipes/recipe-edit/components
```

---

## Task 2: Create RecipeComponentEditorViewModel

**Goal:** Sub-viewmodel for editing a single component's ingredients and steps using Signal Forms. This VM owns all edit state and logic; sub-components are purely presentational.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/recipe-component-editor.vm.ts`

- [ ] **Step 1: Write the sub-VM**

```typescript
import { Injectable, input, linkedSignal, signal } from "@angular/core";
import { form } from "@angular/forms/signals";
import type { ComponentResource, Quantity } from "@/shared/server";
import { formatQuantity, parseQuantity } from "@/shared/utils/unit";

export interface EditableIngredient {
  id: string;
  name: string;
  quantity: string;
  notes: string;
}

export interface EditableStep {
  id: string;
  body: string;
}

export interface ParsedIngredient {
  id: string;
  name: string;
  quantity: Quantity;
  notes: string | null;
}

export interface ParsedStep {
  id: string;
  body: string;
  stepOrder: number;
}

@Injectable()
export class RecipeComponentEditorViewModel {
  readonly component = input.required<ComponentResource>();

  readonly ingredientModel = linkedSignal<EditableIngredient[]>(() =>
    (this.component().ingredients ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      quantity: formatQuantity(i.quantity, { unitDisplay: "short" }),
      notes: i.notes ?? "",
    })),
  );

  readonly ingredientsForm = form(this.ingredientModel);

  readonly parseErrors = signal<Map<number, string>>(new Map());

  addIngredient(): void {
    const newItem: EditableIngredient = {
      id: `temp-${Date.now()}`,
      name: "",
      quantity: "",
      notes: "",
    };
    this.ingredientModel.update((curr) => [...curr, newItem]);
  }

  deleteIngredient(index: number): void {
    this.ingredientModel.update((curr) => curr.filter((_, i) => i !== index));
    this.parseErrors.update((errors) => {
      const next = new Map(errors);
      next.delete(index);
      return next;
    });
  }

  readonly stepModel = linkedSignal<EditableStep[]>(() =>
    (this.component().steps ?? []).map((s) => ({
      id: s.id,
      body: s.body,
    })),
  );

  readonly stepsForm = form(this.stepModel);

  addStep(): void {
    const newItem: EditableStep = {
      id: `temp-${Date.now()}`,
      body: "",
    };
    this.stepModel.update((curr) => [...curr, newItem]);
  }

  deleteStep(index: number): void {
    this.stepModel.update((curr) => curr.filter((_, i) => i !== index));
  }

  saveChanges(): void {
    const errors = new Map<number, string>();
    const parsedIngredients: ParsedIngredient[] = [];

    for (let i = 0; i < this.ingredientModel().length; i++) {
      const e = this.ingredientModel()[i];
      try {
        const quantity = parseQuantity(e.quantity);
        parsedIngredients.push({
          id: e.id,
          name: e.name,
          quantity,
          notes: e.notes || null,
        });
      } catch (err) {
        errors.set(i, err instanceof Error ? err.message : "Invalid quantity");
      }
    }

    this.parseErrors.set(errors);
    if (errors.size > 0) return;

    const parsedSteps: ParsedStep[] = this.stepModel().map((s, i) => ({
      id: s.id,
      body: s.body,
      stepOrder: i,
    }));

    // TODO: POST /api/recipes/{slug}/components/{componentId}
    console.log("Saving component:", this.component().id, {
      ingredients: parsedIngredients,
      steps: parsedSteps,
    });
  }
}
```

---

## Task 3: Create RecipeComponentsViewModel

**Goal:** Parent viewmodel. Wraps `RecipeEditViewModel`, exposes the first component.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/recipe-components.vm.ts`

- [ ] **Step 1: Write the parent VM**

```typescript
import { computed, Injectable, inject } from "@angular/core";
import { RecipeEditViewModel } from "../recipe-edit.vm";

@Injectable()
export class RecipeComponentsViewModel {
  readonly parentVm = inject(RecipeEditViewModel);
  readonly recipe = this.parentVm.recipe;

  readonly components = computed(() => this.recipe.value()?.components ?? []);

  /** Only the first component for now. */
  readonly firstComponent = computed(() => this.components()[0] ?? null);
}
```

---

## Task 4: Create EditorIngredientComponent

**Goal:** Presentational leaf component for a single ingredient row. Receives a form group, index, and optional parse error. Emits delete event.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/editor-ingredient.component.ts`

- [ ] **Step 1: Write the component**

```typescript
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FormGroupSignal } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrash } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";
import type { EditableIngredient } from "./recipe-component-editor.vm";

@Component({
  selector: "app-editor-ingredient",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, FormField, ZardButtonComponent, ZardInputDirective],
  template: `
    <div class="flex flex-col gap-2 border border-stone-100 rounded-lg p-3">
      <div class="grid grid-cols-[1fr,auto,auto] gap-2 items-start">
        <input
          z-input
          [formField]="ingredientForm().name"
          placeholder="Ingredient name"
          class="w-full"
        />
        <div class="flex flex-col gap-1">
          <input
            z-input
            [formField]="ingredientForm().quantity"
            placeholder="Quantity"
            class="w-32"
            [class.border-destructive]="quantityError() != null"
          />
          @if (quantityError(); as err) {
            <span class="text-xs text-destructive">{{ err }}</span>
          }
        </div>
        <button
          z-button
          zType="ghost"
          zSize="icon-xs"
          (click)="delete.emit()"
          class="shrink-0"
        >
          <ng-icon name="lucideTrash" />
        </button>
      </div>
      <textarea
        z-input
        zType="textarea"
        [formField]="ingredientForm().notes"
        placeholder="Add notes..."
        class="w-full min-h-[40px]"
      ></textarea>
    </div>
  `,
  viewProviders: [provideIcons({ lucideTrash })],
})
export class EditorIngredientComponent {
  readonly ingredientForm = input.required<FormGroupSignal<EditableIngredient>>();
  readonly quantityError = input<string | undefined>(undefined);
  readonly delete = output();
}
```

Note: The parent sets `[attr.data-testid]="'component-editor-ingredient-row-' + index()"` on the host element in the list component — see Task 5.

---

## Task 5: Create ComponentEditorIngredientListComponent

**Goal:** Presentational container for the ingredient list. Receives form array and parse errors from the editor VM. Iterates over ingredients, renders `EditorIngredientComponent` for each. Emits add/delete events.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/component-editor-ingredient-list.component.ts`

- [ ] **Step 1: Write the component**

```typescript
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FormSignal } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCarrot, lucidePlus } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import type { EditableIngredient } from "./recipe-component-editor.vm";
import { EditorIngredientComponent } from "./editor-ingredient.component";

@Component({
  selector: "app-component-editor-ingredient-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent, EditorIngredientComponent],
  template: `
    <section class="flex flex-col gap-4" data-testid="component-editor-ingredients">
      <div class="flex items-center gap-2 text-stone-500 font-medium uppercase text-xs tracking-wider border-b border-stone-200 pb-2">
        <ng-icon name="lucideCarrot" class="size-4" />
        <span>Ingredients</span>
      </div>

      @if (ingredientsForm().length > 0) {
        <div class="flex flex-col gap-3">
          @for (ingredientForm of ingredientsForm(); track $index) {
            <app-editor-ingredient
              [ingredientForm]="ingredientForm"
              [attr.data-testid]="'component-editor-ingredient-row-' + $index"
              [quantityError]="parseErrors().get($index) ?? undefined"
              (delete)="deleteIngredient.emit($index)"
            />
          }
        </div>
      }

      <button
        z-button
        zType="outline"
        zSize="sm"
        (click)="addIngredient.emit()"
        data-testid="component-editor-add-ingredient"
      >
        <ng-icon name="lucidePlus" class="size-4" />
        Add ingredient
      </button>
    </section>
  `,
  viewProviders: [provideIcons({ lucideCarrot, lucidePlus })],
})
export class ComponentEditorIngredientListComponent {
  readonly ingredientsForm = input.required<FormSignal<EditableIngredient[]>>();
  readonly parseErrors = input.required<Map<number, string>>();
  readonly deleteIngredient = output<number>();
  readonly addIngredient = output();
}
```

---

## Task 6: Create EditorStepComponent

**Goal:** Presentational leaf component for a single step row. Receives a form group and index. Emits delete event.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/editor-step.component.ts`

- [ ] **Step 1: Write the component**

```typescript
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FormGroupSignal } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrash } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";
import type { EditableStep } from "./recipe-component-editor.vm";

@Component({
  selector: "app-editor-step",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, FormField, ZardButtonComponent, ZardInputDirective],
  template: `
    <div class="flex items-start gap-2 border border-stone-100 rounded-lg p-3">
      <span class="text-teal-600 font-medium shrink-0 pt-2">{{ index() + 1 }}.</span>
      <input
        z-input
        [formField]="stepForm().body"
        placeholder="Step instruction..."
        class="w-full"
      />
      <button
        z-button
        zType="ghost"
        zSize="icon-xs"
        (click)="delete.emit()"
        class="shrink-0"
      >
        <ng-icon name="lucideTrash" />
      </button>
    </div>
  `,
  viewProviders: [provideIcons({ lucideTrash })],
})
export class EditorStepComponent {
  readonly stepForm = input.required<FormGroupSignal<EditableStep>>();
  readonly index = input.required<number>();
  readonly delete = output();
}
```

Note: The parent sets `[attr.data-testid]="'component-editor-step-row-' + index()"` on the host element in the list component — see Task 7.

---

## Task 7: Create ComponentEditorStepsListComponent

**Goal:** Presentational container for the step list. Receives form array from the editor VM. Iterates over steps, renders `EditorStepComponent` for each. Emits add/delete events.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/component-editor-steps-list.component.ts`

- [ ] **Step 1: Write the component**

```typescript
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FormSignal } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideListOrdered, lucidePlus } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import type { EditableStep } from "./recipe-component-editor.vm";
import { EditorStepComponent } from "./editor-step.component";

@Component({
  selector: "app-component-editor-steps-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent, EditorStepComponent],
  template: `
    <section class="flex flex-col gap-4" data-testid="component-editor-steps">
      <div class="flex items-center gap-2 text-stone-500 font-medium uppercase text-xs tracking-wider border-b border-stone-200 pb-2">
        <ng-icon name="lucideListOrdered" class="size-4" />
        <span>Steps</span>
      </div>

      @if (stepsForm().length > 0) {
        <div class="flex flex-col gap-3">
          @for (stepForm of stepsForm(); track $index) {
            <app-editor-step
              [stepForm]="stepForm"
              [index]="$index"
              [attr.data-testid]="'component-editor-step-row-' + $index"
              (delete)="deleteStep.emit($index)"
            />
          }
        </div>
      }

      <button
        z-button
        zType="outline"
        zSize="sm"
        (click)="addStep.emit()"
        data-testid="component-editor-add-step"
      >
        <ng-icon name="lucidePlus" class="size-4" />
        Add step
      </button>
    </section>
  `,
  viewProviders: [provideIcons({ lucideListOrdered, lucidePlus })],
})
export class ComponentEditorStepsListComponent {
  readonly stepsForm = input.required<FormSignal<EditableStep[]>>();
  readonly deleteStep = output<number>();
  readonly addStep = output();
}
```

---

## Task 8: Create RecipeComponentEditorComponent (Editor Container)

**Goal:** Thin container component. Receives component via input, injects editor VM. Delegates ingredient list and step list to sub-components. Owns the save bar.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/recipe-component-editor.component.ts`

- [ ] **Step 1: Write the container component**

```typescript
import { ChangeDetectionStrategy, Component, effect, inject, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSave } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import type { ComponentResource } from "@/shared/server";
import { RecipeComponentEditorViewModel } from "./recipe-component-editor.vm";
import { ComponentEditorIngredientListComponent } from "./component-editor-ingredient-list.component";
import { ComponentEditorStepsListComponent } from "./component-editor-steps-list.component";

@Component({
  selector: "app-recipe-component-editor",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeComponentEditorViewModel],
  imports: [
    NgIcon,
    ZardButtonComponent,
    ComponentEditorIngredientListComponent,
    ComponentEditorStepsListComponent,
  ],
  template: `
    <div class="bg-white rounded-lg border border-stone-200 p-6 flex flex-col gap-6" data-testid="component-editor">
      <h3 class="font-serif text-2xl text-stone-800" data-testid="component-editor-title">
        {{ component().name || "Component 1" }}
      </h3>

      <app-component-editor-ingredient-list
        [ingredientsForm]="vm.ingredientsForm"
        [parseErrors]="vm.parseErrors()"
        (addIngredient)="vm.addIngredient()"
        (deleteIngredient)="vm.deleteIngredient($event)"
      />

      <app-component-editor-steps-list
        [stepsForm]="vm.stepsForm"
        (addStep)="vm.addStep()"
        (deleteStep)="vm.deleteStep($event)"
      />

      <!-- Save -->
      <div class="flex justify-end items-center gap-3 border-t border-stone-100 pt-4">
        @if (vm.parseErrors().size > 0) {
          <span class="text-sm text-destructive" data-testid="component-editor-save-error">
            Fix quantity errors before saving
          </span>
        }
        <button
          z-button
          zType="default"
          zSize="sm"
          (click)="vm.saveChanges()"
          data-testid="component-editor-save"
        >
          Save changes
        </button>
      </div>
    </div>
  `,
  viewProviders: [provideIcons({ lucideSave })],
})
export class RecipeComponentEditorComponent {
  readonly component = input.required<ComponentResource>();
  protected readonly vm = inject(RecipeComponentEditorViewModel);

  constructor() {
    effect(() => {
      const comp = this.component();
      (this.vm as unknown as { component: { set: (c: ComponentResource) => void } }).component.set(comp);
    });
  }
}
```

---

## Task 9: Create RecipeComponentsComponent (Page)

**Goal:** Parent page component. Selects the first component and renders the editor sub-component.

**Files:**
- Create: `frontend/src/app/features/recipes/recipe-edit/components/recipe-components.component.ts`

- [ ] **Step 1: Write the page component**

```typescript
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLayers } from "@ng-icons/lucide";
import { RecipeComponentsViewModel } from "./recipe-components.vm";
import { RecipeComponentEditorComponent } from "./recipe-component-editor.component";

@Component({
  selector: "app-recipe-components",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeComponentsViewModel],
  imports: [NgIcon, RecipeComponentEditorComponent],
  template: `
    <div class="flex flex-col gap-6" data-testid="components-page">
      <div>
        <h2 class="font-bold text-teal-600 flex flex-col gap-2 text-lg" data-testid="recipe-name">
          {{ vm.recipe.value()?.name }}
        </h2>
        <h1 class="font-serif text-4xl" data-testid="components-heading">Components</h1>
      </div>
      <p class="text-sm text-stone-500" data-testid="components-description">
        Edit ingredients and steps for the first component.
      </p>

      @if (vm.firstComponent(); as component) {
        <app-recipe-component-editor [component]="component" />
      } @else {
        <div class="flex flex-col items-center justify-center py-12 text-stone-500" data-testid="components-empty">
          <ng-icon name="lucideLayers" class="size-12 mb-4 opacity-50" />
          <p class="text-sm">No components yet.</p>
        </div>
      }
    </div>
  `,
  viewProviders: [provideIcons({ lucideLayers })],
})
export class RecipeComponentsComponent {
  protected readonly vm = inject(RecipeComponentsViewModel);
}
```

---

## Task 10: Update Routes

**Goal:** Point `components` route at the new file, remove detail route.

**Files:**
- Modify: `frontend/src/app/features/recipes/recipe-edit/recipe-edit.routes.ts`

- [ ] **Step 1: Read current routes**

```bash
cat /home/almar/projects/recipebase/frontend/src/app/features/recipes/recipe-edit/recipe-edit.routes.ts
```

- [ ] **Step 2: Replace content**

```typescript
import type { Routes } from "@angular/router";

export const ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./recipe-edit-shell.component").then((m) => m.RecipeEditShellComponent),
    children: [
      {
        path: "",
        redirectTo: "info",
        pathMatch: "full",
      },
      {
        path: "info",
        loadComponent: () => import("./recipe-edit-info.component").then((m) => m.RecipeEditInfoComponent),
      },
      {
        path: "components",
        loadComponent: () =>
          import("./components/recipe-components.component").then(
            (m) => m.RecipeComponentsComponent,
          ),
      },
    ],
  },
];
```

---

## Task 11: Delete Old Files

**Goal:** Remove the old `variant-components/` directory.

**Commands:**

- [ ] **Step 1: Delete old directory**

```bash
rm -rf /home/almar/projects/recipebase/frontend/src/app/features/recipes/recipe-edit/variant-components/
```

- [ ] **Step 2: Verify deletion**

```bash
ls /home/almar/projects/recipebase/frontend/src/app/features/recipes/recipe-edit/variant-components/ 2>&1 || echo "Directory removed"
```

---

## Task 12: Create Page Object for Components Editor

**Goal:** Create a Playwright page object for the components editor page.

**Files:**
- Create: `frontend/e2e/recipes/recipe-components.po.ts`

- [ ] **Step 1: Write the page object**

```typescript
import type { Locator, Page } from "@playwright/test";

export class RecipeComponentsPage {
  readonly pageHeading: Locator;
  readonly recipeName: Locator;
  readonly heading: Locator;
  readonly description: Locator;
  readonly empty: Locator;

  // Editor (single component)
  readonly editor: Locator;
  readonly editorTitle: Locator;
  readonly ingredientsSection: Locator;
  readonly stepsSection: Locator;
  readonly addIngredientBtn: Locator;
  readonly addStepBtn: Locator;
  readonly saveBtn: Locator;
  readonly saveError: Locator;

  constructor(public readonly page: Page) {
    this.pageHeading = page.getByTestId("components-page");
    this.recipeName = page.getByTestId("recipe-name");
    this.heading = page.getByTestId("components-heading");
    this.description = page.getByTestId("components-description");
    this.empty = page.getByTestId("components-empty");

    this.editor = page.getByTestId("component-editor");
    this.editorTitle = page.getByTestId("component-editor-title");
    this.ingredientsSection = page.getByTestId("component-editor-ingredients");
    this.stepsSection = page.getByTestId("component-editor-steps");
    this.addIngredientBtn = page.getByTestId("component-editor-add-ingredient");
    this.addStepBtn = page.getByTestId("component-editor-add-step");
    this.saveBtn = page.getByTestId("component-editor-save");
    this.saveError = page.getByTestId("component-editor-save-error");
  }

  async goto(slug: string) {
    await this.page.goto(`/recipes/${slug}/edit/components`);
  }

  ingredientRow(index: number): Locator {
    return this.page.getByTestId(`component-editor-ingredient-row-${index}`);
  }

  ingredientDeleteBtn(index: number): Locator {
    return this.ingredientRow(index).locator("button").first();
  }

  ingredientNameInput(index: number): Locator {
    return this.ingredientRow(index).locator('input[placeholder="Ingredient name"]');
  }

  ingredientQuantityInput(index: number): Locator {
    return this.ingredientRow(index).locator('input[placeholder="Quantity"]');
  }

  ingredientNotesTextarea(index: number): Locator {
    return this.ingredientRow(index).locator('textarea[placeholder="Add notes..."]');
  }

  ingredientQuantityError(index: number): Locator {
    return this.ingredientRow(index).locator("span.text-xs.text-destructive");
  }

  stepRow(index: number): Locator {
    return this.page.getByTestId(`component-editor-step-row-${index}`);
  }

  stepDeleteBtn(index: number): Locator {
    return this.stepRow(index).locator("button").first();
  }

  stepBodyInput(index: number): Locator {
    return this.stepRow(index).locator('input[placeholder="Step instruction..."]');
  }
}
```

Note: Since delete buttons and error spans are inside sub-component shadow DOM, use scoped `.locator()` calls on the row element rather than separate `data-testid` attributes. Row-level `data-testid` is set via `[attr.data-testid]` on host elements in the list components (Tasks 5 and 7).

---

## Task 13: Write Integration Tests

**Goal:** Write Playwright E2E tests validating the ingredient and step editing experience.

**Files:**
- Create: `frontend/e2e/recipes/recipe-components.spec.ts`

- [ ] **Step 1: Write integration tests**

```typescript
import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeComponentsPage } from "./recipe-components.po";

const mockRecipe: Recipe = {
  id: "1",
  slug: "pasta",
  name: "Fresh Pasta",
  tags: ["italian"],
  source: { type: "original" },
  yield: {
    quantity: { type: "decimal", unit: { type: "custom", name: "servings" }, amount: 4 },
    description: null,
  },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  notes: null,
  components: [
    {
      id: "comp-1",
      slug: "dough",
      name: null,
      position: 1,
      ingredients: [
        {
          id: "ing-1",
          slug: "flour",
          name: "Flour",
          quantity: { type: "decimal", amount: 500, unit: { type: "gram" } },
          notes: "Type 00",
          position: 1,
        },
        {
          id: "ing-2",
          slug: "eggs",
          name: "Eggs",
          quantity: { type: "decimal", amount: 5, unit: { type: "arbitrary" } },
          notes: null,
          position: 2,
        },
      ],
      steps: [
        {
          id: "step-1",
          slug: "mix",
          stepOrder: 1,
          body: "Mix flour and eggs until combined.",
          timer: null,
        },
        {
          id: "step-2",
          slug: "knead",
          stepOrder: 2,
          body: "Knead for 10 minutes.",
          timer: null,
        },
      ],
    },
  ],
} as Recipe;

test.describe("recipe components editor", () => {
  test("displays first component with pre-populated ingredients and steps", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("shows page heading and recipe name", async () => {
      await expect(editor.pageHeading).toBeVisible();
      await expect(editor.recipeName).toHaveText("Fresh Pasta");
      await expect(editor.heading).toHaveText("Components");
    });

    await test.step("shows component editor with default title for null name", async () => {
      await expect(editor.editor).toBeVisible();
      await expect(editor.editorTitle).toHaveText("Component 1");
    });

    await test.step("pre-populates ingredients from API", async () => {
      await expect(editor.ingredientRow(0)).toBeVisible();
      await expect(editor.ingredientNameInput(0)).toHaveValue("Flour");
      await expect(editor.ingredientQuantityInput(0)).toHaveValue("500 g");
      await expect(editor.ingredientNotesTextarea(0)).toHaveValue("Type 00");

      await expect(editor.ingredientRow(1)).toBeVisible();
      await expect(editor.ingredientNameInput(1)).toHaveValue("Eggs");
      await expect(editor.ingredientQuantityInput(1)).toHaveValue("5");
      await expect(editor.ingredientNotesTextarea(1)).toHaveValue("");
    });

    await test.step("pre-populates steps from API", async () => {
      await expect(editor.stepRow(0)).toBeVisible();
      await expect(editor.stepBodyInput(0)).toHaveValue("Mix flour and eggs until combined.");

      await expect(editor.stepRow(1)).toBeVisible();
      await expect(editor.stepBodyInput(1)).toHaveValue("Knead for 10 minutes.");
    });
  });

  test("adds and deletes ingredients", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("adds a new ingredient row with empty fields", async () => {
      await expect(editor.ingredientRow(0)).toHaveCount(1);
      await expect(editor.ingredientRow(1)).toHaveCount(1);

      await editor.addIngredientBtn.click();

      await expect(editor.ingredientRow(2)).toBeVisible();
      await expect(editor.ingredientNameInput(2)).toHaveValue("");
      await expect(editor.ingredientQuantityInput(2)).toHaveValue("");
    });

    await test.step("deletes first ingredient", async () => {
      await editor.ingredientDeleteBtn(0).click();

      // The old index 1 should now be index 0
      await expect(editor.ingredientNameInput(0)).toHaveValue("Eggs");
      await expect(editor.ingredientRow(0)).toHaveCount(1);
      // The newly added ingredient should now be index 1
      await expect(editor.ingredientRow(1)).toBeVisible();
    });
  });

  test("adds and deletes steps", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("adds a new step row with empty body", async () => {
      await expect(editor.stepRow(0)).toHaveCount(1);
      await expect(editor.stepRow(1)).toHaveCount(1);

      await editor.addStepBtn.click();

      await expect(editor.stepRow(2)).toBeVisible();
      await expect(editor.stepBodyInput(2)).toHaveValue("");
    });

    await test.step("deletes first step", async () => {
      await editor.stepDeleteBtn(0).click();

      await expect(editor.stepBodyInput(0)).toHaveValue("Knead for 10 minutes.");
      await expect(editor.stepRow(1)).toBeVisible();
    });
  });

  test("shows quantity parse error on save with invalid quantity", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("enter invalid empty quantity", async () => {
      await editor.ingredientQuantityInput(0).fill("");
    });

    await test.step("save button shows validation error", async () => {
      await editor.saveBtn.click();
      await expect(editor.ingredientQuantityError(0)).toBeVisible();
      await expect(editor.saveError).toBeVisible();
    });
  });

  test("shows empty state when no components", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...mockRecipe, components: [] }),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("shows empty state instead of editor", async () => {
      await expect(editor.empty).toBeVisible();
      await expect(editor.editor).not.toBeVisible();
    });
  });
});
```

---

## Task 14: Update Existing E2E Test

**Goal:** Update the existing `recipe-edit.spec.ts` test that verifies the components page to match the new editor structure.

**Files:**
- Modify: `frontend/e2e/recipes/recipe-edit.spec.ts`

- [ ] **Step 1: Update the "displays components page" test**

The test at the bottom of `recipe-edit.spec.ts` currently checks that `components-heading` is visible and has text "Components". After our changes, the components page may also show the editor when there are components. Update the mock recipe to include a component so the editor renders too:

```typescript
test("recipe edit components — displays components page", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...mockRecipe,
        components: [
          {
            id: "comp-1",
            slug: "dough",
            name: null,
            position: 1,
            ingredients: [],
            steps: [],
          },
        ],
      }),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "components");

  await test.step("shows recipe name in heading", async () => {
    await expect(editPage.recipeName).toBeVisible();
    await expect(editPage.recipeName).toHaveText("Fresh Pasta");
  });

  await test.step("shows components heading", async () => {
    await expect(editPage.componentsHeading).toBeVisible();
    await expect(editPage.componentsHeading).toHaveText("Components");
  });

  await test.step("shows component editor", async () => {
    await expect(page.getByTestId("component-editor")).toBeVisible();
  });
});
```

---

## Task 15: Verify Build

**Goal:** Ensure TypeScript compiles, Biome passes, and Playwright tests pass.

**Commands:**

- [ ] **Step 1: Run TypeScript check**

```bash
cd /home/almar/projects/recipebase/frontend
npx tsc --noEmit 2>&1 | head -50
```

- [ ] **Step 2: Run Biome format/lint**

```bash
cd /home/almar/projects/recipebase/frontend
npx @biomejs/biome check --write src/app/features/recipes/recipe-edit/
```

- [ ] **Step 3: Build check**

```bash
cd /home/almar/projects/recipebase/frontend
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **Step 4: Run Playwright tests**

Start dev server first:
```bash
cd /home/almar/projects/recipebase/frontend
npx ng serve &
```

Then run tests:
```bash
npx playwright test recipe-components
```

Expected: All tests pass.

- [ ] **Step 5: Run full e2e suite**

```bash
cd /home/almar/projects/recipebase/frontend
npx playwright test
```

Expected: All existing tests still pass.

---

## Verification Checklist

After completing all tasks:

- [ ] `recipe-component-editor.vm.ts` exists with ingredient + step editing logic
- [ ] `editor-ingredient.component.ts` exists as single ingredient row component
- [ ] `component-editor-ingredient-list.component.ts` exists as ingredient list container
- [ ] `editor-step.component.ts` exists as single step row component
- [ ] `component-editor-steps-list.component.ts` exists as step list container
- [ ] `recipe-component-editor.component.ts` exists as thin editor container
- [ ] `recipe-components.vm.ts` exists as parent VM with `firstComponent` computed
- [ ] `recipe-components.component.ts` exists as parent component rendering editor
- [ ] `recipe-edit.routes.ts` imports from `./components/` path, no detail route
- [ ] Old `variant-components/` directory removed
- [ ] `recipe-components.po.ts` page object created with all testid locators
- [ ] `recipe-components.spec.ts` integration tests written (5 test cases)
- [ ] `recipe-edit.spec.ts` updated for new editor structure
- [ ] TypeScript compiles without errors
- [ ] Biome formatting passes
- [ ] Build succeeds
- [ ] Playwright tests pass

---

## Notes for Implementer

0. **Spacing:** Never use side margins (`ml-*`, `mr-*`, `mb-*`, `mt-*` on siblings). Always use `flex gap-*` on the parent container to control spacing between children. This ensures consistent, composable layout without margin-collapsing surprises.

1. **Two-VM, six-component architecture:** `RecipeComponentsViewModel` (parent) + `RecipeComponentEditorViewModel` (editor) own all state and logic. The four sub-components (`EditorIngredient`, `ComponentEditorIngredientList`, `EditorStep`, `ComponentEditorStepsList`) are purely presentational — they receive form signals via inputs and emit actions via outputs. No VM injection below the editor level.

2. **Signal Forms for two-way binding:** Uses `[formField]` directive and `form(signal)` — no manual update handlers needed. Models are `linkedSignal` that auto-populate from the component input. Form groups are passed down to leaf components as `FormGroupSignal<EditableIngredient>` / `FormGroupSignal<EditableStep>` inputs.

3. **Data flow (one-way):** VM owns form state → editor container passes form signals to list containers → list containers iterate and pass individual form groups to leaf components. Actions bubble up via `output()`: leaf emits delete → list emits `deleteIngredient($index)` → editor calls `vm.deleteIngredient($event)`.

4. **Quantity round-trip:** `formatQuantity(i.quantity, { unitDisplay: "short" })` for display, `parseQuantity(text)` for save. Parse errors tracked per ingredient index as `Map<number, string>`, passed through ingredient list to individual rows as `quantityError: string | undefined`.

5. **Icon requirements per component:** `EditorIngredient`: `lucideTrash`. `ComponentEditorIngredientList`: `lucideCarrot`, `lucidePlus`. `EditorStep`: `lucideTrash`. `ComponentEditorStepsList`: `lucideListOrdered`, `lucidePlus`. `RecipeComponentEditor`: `lucideSave`. `RecipeComponents`: `lucideLayers`.

6. **Save wired to console.log:** No API endpoint yet. Save validates ingredients and logs the parsed payload.

7. **Title/description null:** Component name defaults to "Component 1" in the editor when null. No title/description fields.

8. **Playwright patterns:** All locators use `data-testid` exclusively. Tests use `test.step()` blocks. Page object has methods for interactions, tests never call `page.getBy*` directly.

9. **Test data:** The mock recipe includes ingredients with various quantity types (decimal with standard unit, decimal with arbitrary unit) and steps to validate round-trip formatting. Component name is `null` to validate the "Component 1" fallback.

10. **Testid placement on sub-component host elements:** Since testids like `component-editor-ingredient-row-{index}` must be on the DOM element wrapping each ingredient row, they are set via `[attr.data-testid]` on the `<app-editor-ingredient>` host element in the list component template. This keeps testids in the Playwright-scannable DOM while preserving component encapsulation. Delete buttons and error messages inside sub-components use scoped `.locator()` calls on the row element rather than separate testid attributes.
