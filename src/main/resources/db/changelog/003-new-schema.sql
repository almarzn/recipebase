--liquibase formatted sql

-- ============================================================
-- 001 — item
-- ============================================================
--changeset recipebase:003-item
CREATE TABLE item (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,
    type        TEXT        NOT NULL CHECK (type IN ('recipe', 'assembly')),
    name        TEXT        NOT NULL,
    tags        TEXT[]      NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
--rollback DROP TABLE item;

-- ============================================================
-- 002 — recipe
-- ============================================================
--changeset recipebase:003-recipe
CREATE TABLE recipe (
    id       UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id  UUID  NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    source   JSONB,
    yield    JSONB,
    notes    TEXT
);

CREATE INDEX idx_recipe_item_id ON recipe(item_id);
--rollback DROP TABLE recipe;

-- ============================================================
-- 003 — recipe_component
-- ============================================================
--changeset recipebase:003-recipe-component
CREATE TABLE recipe_component (
    id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id  UUID  NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    slug       TEXT  NOT NULL,
    name       TEXT,
    position   INT   NOT NULL,
    UNIQUE (recipe_id, slug),
    UNIQUE (recipe_id, position)
);

CREATE INDEX idx_recipe_component_recipe_id ON recipe_component(recipe_id);
--rollback DROP TABLE recipe_component;

-- ============================================================
-- 004 — recipe_ingredient
-- ============================================================
--changeset recipebase:003-recipe-ingredient
CREATE TABLE recipe_ingredient (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID  NOT NULL REFERENCES recipe_component(id) ON DELETE CASCADE,
    slug         TEXT  NOT NULL,
    name         TEXT  NOT NULL,
    quantity     JSONB NOT NULL,
    notes        TEXT,
    position     INT   NOT NULL,
    UNIQUE (component_id, slug),
    UNIQUE (component_id, position)
);

CREATE INDEX idx_recipe_ingredient_component_id ON recipe_ingredient(component_id);
--rollback DROP TABLE recipe_ingredient;

-- ============================================================
-- 005 — recipe_step
-- ============================================================
--changeset recipebase:003-recipe-step
CREATE TABLE recipe_step (
    id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id  UUID  NOT NULL REFERENCES recipe_component(id) ON DELETE CASCADE,
    slug          TEXT  NOT NULL,
    step_order    INT   NOT NULL,
    body          TEXT  NOT NULL,
    timer_seconds INT,
    UNIQUE (component_id, slug),
    UNIQUE (component_id, step_order)
);

CREATE INDEX idx_recipe_step_component_id ON recipe_step(component_id);
--rollback DROP TABLE recipe_step;

-- ============================================================
-- 006 — assembly
-- ============================================================
--changeset recipebase:003-assembly
CREATE TABLE assembly (
    id       UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id  UUID  NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    yield    JSONB
);

CREATE INDEX idx_assembly_item_id ON assembly(item_id);
--rollback DROP TABLE assembly;

-- ============================================================
-- 007 — assembly_component
-- ============================================================
--changeset recipebase:003-assembly-component
CREATE TABLE assembly_component (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    assembly_id    UUID    NOT NULL REFERENCES assembly(id) ON DELETE CASCADE,
    slug           TEXT    NOT NULL,
    comp_order     INT     NOT NULL,
    item_id        UUID    NOT NULL REFERENCES item(id),
    scale_factor   NUMERIC NOT NULL DEFAULT 1,
    locked         BOOLEAN NOT NULL DEFAULT false,
    lock_snapshot  JSONB,
    UNIQUE (assembly_id, slug),
    UNIQUE (assembly_id, comp_order)
);

CREATE INDEX idx_assembly_component_assembly_id ON assembly_component(assembly_id);
--rollback DROP TABLE assembly_component;
