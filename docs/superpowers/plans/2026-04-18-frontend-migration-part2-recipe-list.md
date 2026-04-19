# Frontend Migration Part 2: Recipe List

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update recipe list to fetch from `GET /api/items?type=recipe` and use the new `Item` type.

**Architecture:** VM switches from `GET /api/recipes` → `GET /api/items?type=recipe`. Card component accepts `Item` instead of old `RecipeSummary`. Display `name` + `tags` instead of `title` + `description`/`variants`.

**Tech Stack:** Angular 21, `httpResource`, Biome.

**Depends on:** Part 1 (models) must be done first.

---

**Files:**
- Modify: `frontend/src/app/features/recipes/recipe-list/recipe-list.vm.ts`
- Modify: `frontend/src/app/features/recipes/recipe-list/recipe-card.ts`
- Modify: `frontend/src/app/features/recipes/recipe-list/recipe-list.ts`

---

- [ ] **Step 1: Read current files**

Read all three files before editing:
- `frontend/src/app/features/recipes/recipe-list/recipe-list.vm.ts`
- `frontend/src/app/features/recipes/recipe-list/recipe-card.ts`
- `frontend/src/app/features/recipes/recipe-list/recipe-list.ts`

- [ ] **Step 2: Update `recipe-list.vm.ts`**

Replace the `httpResource` call. Change endpoint to `/api/items` with `type=recipe` param. Change response type to `Item[]`. Remove any `RecipeSummary` import.

Key section:
```typescript
import { Item } from '../../../shared/models';

// inside class:
readonly items = httpResource<Item[]>(() => ({
  url: '/api/items',
  params: { type: 'recipe' },
}));
```

- [ ] **Step 3: Update `recipe-card.ts`**

Accept `Item` input instead of `RecipeSummary`. Display `item.name` instead of `item.title`. Replace `description`/`variants` display with `item.tags` — show each tag as a small badge if tags array is non-empty. Remove any import of old types.

- [ ] **Step 4: Update `recipe-list.ts`**

Update template to pass `Item` objects to the card. Replace any `.title` references with `.name`. Update the type annotation on the items signal/variable to `Item[]`.

- [ ] **Step 5: Format + verify compile**

```bash
cd frontend && npx @biomejs/biome check --write src/app/features/recipes/recipe-list/
npx ng build 2>&1 | grep -E "error|Error" | head -30
```

Expected: no type errors in list feature.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/features/recipes/recipe-list/
git commit -m "feat(frontend): recipe list uses GET /items?type=recipe"
```
