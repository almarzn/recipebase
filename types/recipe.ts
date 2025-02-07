import { z } from "zod";
import type { Database } from "~/types/database.types";

const zEmptyStrToUndefined = (schema: z.ZodType) =>
  z.preprocess((arg: unknown) => {
    if (arg === "") {
      return undefined;
    }

    return arg;
  }, schema);

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

export const servingsSchema = z.object({
  amount: z.number().positive(),
  notes: z.string().optional(),
});

export type RecipeServings = z.infer<typeof servingsSchema>;

export type IngredientUnit = z.infer<typeof ingredientUnitSchema>;

export const ingredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(500).trim().nonempty(),
  quantity: z.coerce.number().nonnegative().optional(),
  unit: ingredientUnitSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;

export const separatorSchema = z.object({
  id: z.string().uuid(),
  separate: z.string(),
});

export const stepSchema = z.object({
  id: z.string().uuid(),
  text: z.string().max(500).trim().nonempty({
    message: "Each step should at least contain one non-blank character",
  }),
  notes: z.string().max(500).optional(),
});

export type Step = z.infer<typeof stepSchema>;

export const ingredientFieldSchema = z.array(
  ingredientSchema.or(separatorSchema),
);

export const metadataSchema = z.object({
  original_url: zEmptyStrToUndefined(z.string().url().optional()),
  original_author: zEmptyStrToUndefined(z.string().optional()),
});

export type Metadata = z.infer<typeof metadataSchema>;

export const recipePayload = z.object({
  name: z.string().max(500).trim().nonempty(),
  description: z.string().max(1000).optional(),
  ingredients: ingredientFieldSchema,
  steps: z.array(stepSchema),
  tags: z.array(z.string()),
  servings: servingsSchema.or(z.null()),
  metadata: metadataSchema.or(z.null()),
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

export type RecipeDetailsSaved = Omit<RecipePayload, "tags"> & {
  id: string;
  tags: TagProps[];
  saved: {
    servings?: number;
  };
};

export type ExistingRecipe = z.infer<typeof existingRecipeSchema>;
