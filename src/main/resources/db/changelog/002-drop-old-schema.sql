--liquibase formatted sql

--changeset recipebase:002-drop-old-schema
DROP TABLE IF EXISTS recipe_step;
DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS recipe_component;
DROP TABLE IF EXISTS recipe_variant;
DROP TABLE IF EXISTS recipe;
--rollback -- no rollback; clean slate assumed
