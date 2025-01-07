import { z } from "zod";

export const realUnitSchema = z.enum([
  "GRAM",
  "KILOGRAM",
  "MILLITER",
  "LITER",
  "ARBITRARY",
]);
export type IngredientUnit = z.infer<typeof realUnitSchema>;

export const ingredientSchema = z.object({
  name: z.string().max(500).trim().nonempty(),
  quantity: z.number().positive(),
  unit: realUnitSchema,
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

export const recipeSchema = z.object({
  name: z.string().max(500).trim(),
  description: z.string().max(1000).optional(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
});

export const existingRecipeSchema = recipeSchema.extend({
  id: z.string(),
});

export type Recipe = z.infer<typeof recipeSchema>;
export type ExistingRecipe = z.infer<typeof existingRecipeSchema>;
