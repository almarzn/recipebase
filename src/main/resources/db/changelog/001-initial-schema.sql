--liquibase formatted sql

-- ============================================================
-- Changeset 001 — recipe
-- ============================================================
-- Core recipe entity. current_variant_id is nullable to break
-- the circular dependency at insert time; the FK is added as
-- a separate deferrable constraint in changeset 003.
-- ============================================================
--changeset recipebase:001-recipe
CREATE TABLE recipe (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug               TEXT        NOT NULL UNIQUE,
    title              TEXT        NOT NULL,
    description        TEXT,
    current_variant_id UUID,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
--rollback DROP TABLE recipe;

-- ============================================================
-- Changeset 002 — recipe_variant
-- ============================================================
-- A recipe may have multiple variants (e.g. "chocolate" vs
-- "vanilla" sponge). Slug is unique within a recipe.
-- ============================================================
--changeset recipebase:002-recipe-variant
CREATE TABLE recipe_variant (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id   UUID        NOT NULL REFERENCES recipe (id) ON DELETE CASCADE,
    slug        TEXT        NOT NULL,
    name        TEXT        NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (recipe_id, slug)
);

CREATE INDEX idx_recipe_variant_recipe_id ON recipe_variant (recipe_id);
--rollback DROP TABLE recipe_variant;

-- ============================================================
-- Changeset 003 — recipe.current_variant_id FK (deferrable)
-- ============================================================
-- Must be deferrable so that a recipe and its first variant
-- can be inserted in the same transaction without ordering
-- constraints.
-- ============================================================
--changeset recipebase:003-recipe-current-variant-fk
ALTER TABLE recipe
    ADD CONSTRAINT fk_recipe_current_variant
    FOREIGN KEY (current_variant_id)
    REFERENCES recipe_variant (id)
    DEFERRABLE INITIALLY DEFERRED;
--rollback ALTER TABLE recipe DROP CONSTRAINT fk_recipe_current_variant;

-- ============================================================
-- Changeset 004 — recipe_component
-- ============================================================
-- A component belongs to a variant and is ordered by position.
--
-- `link` stores the sealed Component.Link interface as JSON,
-- using `quality` as the type discriminator:
--
--   Self:
--     {"quality": "self"}
--
--   ExternalRecipe (linked — data fetched from source at runtime):
--     {"quality": "external", "slug": "...", "title": "...", "link": "linked"}
--
--   ExternalRecipe (snapshot — data stored in component's own rows):
--     {"quality": "external", "slug": "...", "title": "...", "link": "snapshot"}
--
-- For snapshot components the ingredient and step rows below
-- contain the point-in-time copy of the referenced recipe.
-- Version-history support for snapshots is deferred.
-- ============================================================
--changeset recipebase:004-recipe-component
CREATE TABLE recipe_component (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id  UUID    NOT NULL REFERENCES recipe_variant (id) ON DELETE CASCADE,
    position    INT     NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT,
    link        JSONB   NOT NULL,
    UNIQUE (variant_id, position)
);

CREATE INDEX idx_recipe_component_variant_id ON recipe_component (variant_id);
--rollback DROP TABLE recipe_component;

-- ============================================================
-- Changeset 005 — recipe_ingredient
-- ============================================================
-- Ingredients belong to a component and are ordered by
-- position. Both self and snapshot components store their
-- ingredient rows here. Linked components have no rows.
--
-- `quantity` stores the sealed Ingredient.Quantity interface
-- as JSON, using `unit` as the type discriminator:
--
--   {"unit": "gram",       "amount": 250}
--   {"unit": "kilogram",   "amount": 1.5}
--   {"unit": "liter",      "amount": 0.5}
--   {"unit": "milliliter", "amount": 200}
--   {"unit": "deciliter",  "amount": 2}
--   {"unit": "centiliter", "amount": 10}
--   {"unit": "unspecified","notes": "a pinch"}
--
-- `slug` identifies the logical ingredient (e.g. "bread-flour")
-- and anticipates a future ingredient catalogue table.
-- ============================================================
--changeset recipebase:005-recipe-ingredient
CREATE TABLE recipe_ingredient (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID  NOT NULL REFERENCES recipe_component (id) ON DELETE CASCADE,
    position     INT   NOT NULL,
    slug         TEXT  NOT NULL,
    name         TEXT  NOT NULL,
    notes        TEXT,
    quantity     JSONB NOT NULL,
    UNIQUE (component_id, position),
    UNIQUE (component_id, slug)
);

CREATE INDEX idx_recipe_ingredient_component_id ON recipe_ingredient (component_id);
--rollback DROP TABLE recipe_ingredient;

-- ============================================================
-- Changeset 006 — recipe_step
-- ============================================================
-- Steps belong to a component and are ordered by position.
--
-- `attachment` stores the nullable Step.TimerAttachment as
-- JSON. Storing the full record (rather than a flat interval
-- column) keeps the shape open for future fields:
--
--   {"duration": "PT1M30S"}
-- ============================================================
--changeset recipebase:006-recipe-step
CREATE TABLE recipe_step (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID  NOT NULL REFERENCES recipe_component (id) ON DELETE CASCADE,
    position     INT   NOT NULL,
    text         TEXT  NOT NULL,
    notes        TEXT,
    attachment   JSONB,
    UNIQUE (component_id, position)
);

CREATE INDEX idx_recipe_step_component_id ON recipe_step (component_id);
--rollback DROP TABLE recipe_step;
