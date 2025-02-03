import { z } from "zod";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ChatClient } from "~/server/api/imports/getChatClient";
import {
  ingredientSchema,
  ingredientUnitSchema,
  type Metadata,
  type RecipePayload,
} from "~/types/recipe";
import { Array } from "effect";
import { v4 } from "uuid";
import type { TrackerGroup } from "are-we-there-yet";
import { startTracker } from "~/server/api/imports/startTracker";

const partsSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      parts: z.array(z.string()).or(z.null()),
      servings: z.object({
        amount: z.number(),
        notes: z.string().or(z.null()),
      }),
    }),
  ),
});

const promptIngredientsSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().or(z.null()),
      unit: ingredientUnitSchema,
      notes: z.string().or(z.null()),
    }),
  ),
});

const promptStepSchema = z.object({
  steps: z.array(
    z.object({
      text: z.string(),
      notes: z.string().or(z.null()),
    }),
  ),
});

const getPrompt = async (name: string) => {
  const storage = useStorage("data");

  return (await storage.getItem(`prompt-${name}.md`)) as string;
};

const normalizeIngredient = () => {
  return ({
    notes,
    ...ingredient
  }: z.infer<typeof promptIngredientsSchema>["ingredients"][0]) => {
    return ingredientSchema.parse({
      ...ingredient,
      id: v4(),
      notes: notes ?? undefined,
    });
  };
};

const extractRecipeIngredients = async (
  recipe: z.infer<typeof partsSchema>["recipes"][0],
  recipeContent: ChatCompletionMessageParam,
  extractPartIngredients: (
    content: ChatCompletionMessageParam[],
  ) => Promise<z.infer<typeof promptIngredientsSchema>>,
): Promise<RecipePayload["ingredients"]> => {
  if (recipe.parts === null) {
    const allIngredients = (
      await extractPartIngredients([
        {
          role: "system",
          content: `For '${recipe.name}' extract all the ingredients.`,
        },
        recipeContent,
      ])
    ).ingredients;

    return allIngredients.map(normalizeIngredient());
  }

  const ingredients = await Promise.all(
    recipe.parts?.map(async (part) => {
      return {
        part: part,
        ingredients: (
          await extractPartIngredients([
            {
              role: "system",
              content: `For '${recipe.name}' extract the ingredient specific to '${part}.'`,
            },
            recipeContent,
          ])
        ).ingredients,
      };
    }) ?? [],
  );

  const ingredientsByPart = Array.groupBy(ingredients, (el) => el.part);

  return recipe.parts.flatMap((part) => [
    {
      id: v4(),
      separate: part,
    },
    ...ingredientsByPart[part][0].ingredients.map(normalizeIngredient()),
  ]);
};

const getIngredientsAndSteps = async (
  chatClient: ChatClient,
  recipeContent: ChatCompletionMessageParam,
  { recipes }: z.infer<typeof partsSchema>,
  top: TrackerGroup,
) => {
  const extractPartIngredients = chatClient(
    await getPrompt("ingredients"),
    promptIngredientsSchema,
  );
  const extractRecipeSteps = chatClient(
    await getPrompt("steps"),
    promptStepSchema,
  );

  return await Promise.all(
    recipes.map(async (recipe) => {
      const unit = top.newItem(`Extracting recipe '${recipe.name}'`, 2);

      return {
        ...recipe,
        ingredients: await extractRecipeIngredients(
          recipe,
          recipeContent,
          extractPartIngredients,
        ).finally(() => unit.completeWork(1)),
        steps: (
          await extractRecipeSteps([
            {
              role: "system",
              content: `For '${recipe.name}' extract the steps'`,
            },
            recipeContent,
          ]).finally(() => unit.completeWork(1))
        ).steps.map((step) => ({
          id: v4(),
          notes: step.notes ?? undefined,
          text: step.text,
        })),
      };
    }),
  );
};

const getRecipeAndParts = async (
  chatClient: ChatClient,
  content: ChatCompletionMessageParam,
) => {
  const extractRecipeAndParts = chatClient(
    await getPrompt("parts"),
    partsSchema,
  );

  return await extractRecipeAndParts([content]);
};

export const extractRecipes = async (
  chatClient: ChatClient,
  content: ChatCompletionMessageParam,
  top: TrackerGroup,
  metadata: Metadata,
): Promise<RecipePayload[]> => {
  const recipePartsUnit = top.newItem(
    "Listing all recipes and their respective parts",
  );

  const recipeContentGroup = top.newGroup(
    "Fetching the content for each recipe",
    8,
  );

  startTracker(recipePartsUnit);

  const recipes = await getRecipeAndParts(chatClient, content);

  recipePartsUnit.finish();

  startTracker(recipeContentGroup);

  const result = await getIngredientsAndSteps(
    chatClient,
    content,
    recipes,
    recipeContentGroup,
  );

  return result.map(({ servings, ...recipe }) => {
    return {
      ...recipe,
      tags: [],
      servings: {
        amount: servings.amount,
        notes: servings.notes ?? undefined,
      },
      metadata,
    };
  });
};
