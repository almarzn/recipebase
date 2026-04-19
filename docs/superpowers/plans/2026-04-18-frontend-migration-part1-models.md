# Frontend Migration Part 1: Data Models

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old recipe model types with new types matching the backend schema.

**Architecture:** Single file rewrite. Downstream parts (2–4) depend on this being done first — all old types (`RecipeSummary`, `Variant`, `VariantSummary`, `ComponentLink`, etc.) are deleted and replaced with `Item`, `Recipe`, `Component`, `Ingredient`, `Step`, `Source`, `Yield`, `Quantity`.

**Tech Stack:** Angular 21, TypeScript, Biome.

**Must complete before:** Parts 2, 3, 4.

---

**Files:**
- Modify: `frontend/src/app/shared/models/recipe.ts`
- Modify: `frontend/src/app/shared/models/index.ts`

---

- [ ] **Step 1: Replace `recipe.ts` with new types**

```typescript
// frontend/src/app/shared/models/recipe.ts

/** Item summary — returned by GET /items */
export interface Item {
  id: string;
  slug: string;
  type: string;
  name: string;
  tags: string[];
}

/** Source JSONB */
export type Source =
  | { type: 'url'; url: string }
  | { type: 'book'; reference: string }
  | { type: 'original' };

/** Yield JSONB */
export interface Yield {
  quantity: number;
  unit: string;
  description: string | null;
}

/** Quantity JSONB — {value, unit} */
export interface Quantity {
  value: number;
  unit: string;
}

export interface Ingredient {
  id: string;
  slug: string;
  name: string;
  quantity: Quantity;
  notes: string | null;
  position: number;
}

export interface Step {
  id: string;
  slug: string;
  order: number;
  body: string;
  timer_seconds: number | null;
}

export interface Component {
  id: string;
  slug: string;
  name: string | null;
  position: number;
  ingredients: Ingredient[];
  steps: Step[];
}

/** Full recipe — returned by GET /recipes/:slug */
export interface Recipe {
  id: string;
  slug: string;
  name: string;
  tags: string[];
  source: Source | null;
  yield: Yield | null;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Update `index.ts` re-exports**

```typescript
// frontend/src/app/shared/models/index.ts
export * from './recipe';
```

- [ ] **Step 3: Format**

```bash
cd frontend && npx @biomejs/biome check --write src/app/shared/models/
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/shared/models/
git commit -m "feat(frontend): replace recipe models with new item/recipe types"
```
