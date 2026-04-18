# Schema Migration Design — 2026-04-18

## Context

Current schema uses `recipe → recipe_variant → recipe_component → recipe_ingredient / recipe_step`.
New schema introduces a polymorphic `item` base entity, drops variants, adds `assembly` type,
and re-homes steps inside components (no separate step API endpoints).

Database is a clean slate — no data to preserve.

---

## Database Schema

### Migration files

**002-drop-old-schema.sql**
Drop in dependency order: `recipe_step`, `recipe_ingredient`, `recipe_component`, `recipe_variant`, `recipe`.

**003-new-schema.sql**
Create all new tables (see below).

### New tables

```sql
item (
  id          UUID        PK DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  type        TEXT        NOT NULL CHECK (type IN ('recipe', 'assembly')),
  name        TEXT        NOT NULL,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)

recipe (
  id       UUID  PK DEFAULT gen_random_uuid(),
  item_id  UUID  NOT NULL REFERENCES item(id) ON DELETE CASCADE,
  source   JSONB,   -- {"type":"url|book|original","url":"...","reference":"..."}
  yield    JSONB    -- {"quantity":..., "unit":"...", "description":"..."}
)

recipe_component (
  id         UUID  PK DEFAULT gen_random_uuid(),
  recipe_id  UUID  NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
  slug       TEXT  NOT NULL,
  name       TEXT,           -- nullable; only needed when recipe has multiple components
  position   INT   NOT NULL,
  UNIQUE (recipe_id, slug),
  UNIQUE (recipe_id, position)
)

recipe_ingredient (
  id           UUID  PK DEFAULT gen_random_uuid(),
  component_id UUID  NOT NULL REFERENCES recipe_component(id) ON DELETE CASCADE,
  slug         TEXT  NOT NULL,
  name         TEXT  NOT NULL,
  quantity     JSONB NOT NULL,  -- {value, unit}
  notes        TEXT,
  position     INT   NOT NULL,
  UNIQUE (component_id, slug),
  UNIQUE (component_id, position)
)

recipe_step (
  id           UUID  PK DEFAULT gen_random_uuid(),
  component_id UUID  NOT NULL REFERENCES recipe_component(id) ON DELETE CASCADE,
  slug         TEXT  NOT NULL,
  "order"      INT   NOT NULL,
  body         TEXT  NOT NULL,
  timer_seconds INT,
  UNIQUE (component_id, slug),
  UNIQUE (component_id, "order")
)

assembly (
  id       UUID  PK DEFAULT gen_random_uuid(),
  item_id  UUID  NOT NULL REFERENCES item(id) ON DELETE CASCADE,
  yield    JSONB    -- {"quantity":..., "unit":"...", "description":"..."}
)

assembly_component (
  id             UUID    PK DEFAULT gen_random_uuid(),
  assembly_id    UUID    NOT NULL REFERENCES assembly(id) ON DELETE CASCADE,
  slug           TEXT    NOT NULL,
  "order"        INT     NOT NULL,
  item_id        UUID    NOT NULL REFERENCES item(id),
  scale_factor   NUMERIC NOT NULL DEFAULT 1,
  locked         BOOLEAN NOT NULL DEFAULT false,
  lock_snapshot  JSONB,  -- snapshot of referenced item at lock time
  UNIQUE (assembly_id, slug),
  UNIQUE (assembly_id, "order")
)
```

---

## API

### Items

```
GET /items          search + list  (q, type, tags)
```

### Recipes

```
POST   /recipes                                       create (also creates item)
GET    /recipes/:slug
PUT    /recipes/:slug
DELETE /recipes/:slug                                 also deletes item

GET    /recipes/:slug/components
POST   /recipes/:slug/components
PUT    /recipes/:slug/components/:component_slug      replaces component metadata + all ingredients + all steps atomically
DELETE /recipes/:slug/components/:component_slug
```

`GET /recipes/:slug` response embeds full component list with ingredients and steps.
`GET /recipes/:slug/components` returns component list with embedded ingredients and steps.

`GET /assemblies/:slug` response embeds full assembly_component list.
`GET /assemblies/:slug/components` returns assembly_component list.

### Assemblies

```
POST   /assemblies
GET    /assemblies/:slug
PUT    /assemblies/:slug
DELETE /assemblies/:slug                              also deletes item

GET    /assemblies/:slug/components
POST   /assemblies/:slug/components
PUT    /assemblies/:slug/components/:component_slug
DELETE /assemblies/:slug/components/:component_slug
```

---

## Java Package Structure

Delete all existing `recipe/` code. Three new packages:

```
item/
  FindItemsUseCase                (search, filter by type / tags)
  resource/
    ItemController                GET /items
    ItemSummaryResource

recipe/
  CreateRecipeUseCase             creates item row (type=recipe) + recipe row
  FindRecipeBySlugUseCase
  UpdateRecipeUseCase
  DeleteRecipeUseCase             cascades to item
  AddComponentUseCase
  ReplaceComponentUseCase         replaces component + ingredients + steps in one tx
  DeleteComponentUseCase
  resource/
    RecipeController
    RecipeResource                full recipe with embedded components
    RecipeSummaryResource
    ComponentResource             component with embedded ingredients + steps

assembly/
  CreateAssemblyUseCase           creates item row (type=assembly) + assembly row
  FindAssemblyBySlugUseCase
  UpdateAssemblyUseCase
  DeleteAssemblyUseCase           cascades to item
  AddAssemblyComponentUseCase
  UpdateAssemblyComponentUseCase
  DeleteAssemblyComponentUseCase
  resource/
    AssemblyController
    AssemblyResource
    AssemblyComponentResource
```

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Steps API | No dedicated endpoints | Steps replaced atomically with component via PUT |
| Steps storage | `recipe_step` w/ `component_id` FK | Data owned by component, no API separate from component |
| Ingredients API | No dedicated endpoints | Same as steps — replaced via component PUT |
| Slug ownership | `item.slug` is canonical | `recipe`/`assembly` rows have no slug column |
| source / yield | JSONB columns | Matches spec structure; avoids nullable column sprawl |
| `component.name` | Nullable | Only needed when recipe has >1 component |
| Migration strategy | Two changesets (drop + create) | Clean rollback boundaries, readable history |
| Java strategy | Full rewrite | Variant model incompatible with new schema |

---

## Migration Approach

Chosen: **two focused Liquibase changesets** (Approach 1 from design session).

1. `002-drop-old-schema` — drops all old tables top-down (steps → ingredients → components → variants → recipes)
2. `003-new-schema` — creates all new tables

jOOQ codegen runs automatically before `compileJava`, regenerating types from the new schema.
All existing `recipe/` Java code deleted before rewrite.
