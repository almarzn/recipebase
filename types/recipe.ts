import { z } from "zod";
import type { Database } from "~/types/database.types";

export const ingredientUnitSchema = z.enum([
  "teaspoon",
  "tablespoon",
  "cup",
  "fluid ounce",
  "pint",
  "quart",
  "gallon",
  "milliliter",
  "liter",
  "deciliter",
  "centiliter",
  "gram",
  "kilogram",
  "milligram",
  "ounce",
  "pound",
  "stone",
  "bushel",
  "peck",
  "gill",
  "dram",
  "scruple",
  "grain",
  "millimeter",
  "centimeter",
  "meter",
  "inch",
  "arbitrary",
]);

export type IngredientUnit = z.infer<typeof ingredientUnitSchema>;

export const ingredientSchema = z.object({
  name: z.string().max(500).trim().nonempty(),
  quantity: z.number().positive().or(z.null()),
  unit: ingredientUnitSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;

export const stepSchema = z.object({
  text: z.string().max(500).trim().nonempty({
    message: "Each step should at least contain one non-blank character",
  }),
  notes: z.string().max(500).optional(),
});

export type Step = z.infer<typeof stepSchema>;

export const recipePayload = z.object({
  name: z.string().max(500).trim().nonempty(),
  description: z.string().max(1000).optional(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
  tags: z.array(z.string()),
});

export const existingRecipeSchema = recipePayload.extend({
  id: z.string(),
});

export type RecipePayload = z.infer<typeof recipePayload>;

export type TagProps = Pick<
  Database["public"]["Tables"]["tags"]["Row"],
  "color" | "icon" | "text" | "id"
>;

export type RecipeDetails = Omit<RecipePayload, "tags"> & {
  id: string;
  tags: TagProps[];
};
export type ExistingRecipe = z.infer<typeof existingRecipeSchema>;
