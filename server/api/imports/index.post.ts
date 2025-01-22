import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import type { RecipePayload } from "~/types/recipe";
import { ingredientUnitSchema } from "~/types/recipe";
import TurndownService from "turndown";
import { v4 } from "uuid";
import { serverSupabaseClient } from "#supabase/server";
import type { H3Event } from "h3";
import { Settings } from "~/lib/Settings";

const payloadSchema = z.object({
  url: z.string().url(),
});

const turndownService = new TurndownService();
turndownService.remove("nav");
turndownService.remove("meta");
turndownService.remove("footer");
turndownService.remove("header");
turndownService.remove("button");
turndownService.remove("img");
turndownService.remove("video");
turndownService.remove("head");
turndownService.remove("script");
turndownService.remove("noscript");
turndownService.addRule("striplinks", {
  filter: "a",
  replacement: (content) => content,
});

const responseFormat = z.object({
  recipes: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      ingredients: z.array(
        z
          .object({
            name: z.string(),
            quantity: z.number().or(z.null()),
            unit: ingredientUnitSchema,
            notes: z.string().or(z.null()),
          })
          .or(
            z.object({
              separate: z.string(),
            }),
          ),
      ),
      steps: z.array(
        z.object({
          text: z.string(),
          notes: z.string().optional(),
        }),
      ),
    }),
  ),
});

const getMarkdownFromUrl = async (event: H3Event) => {
  const payload = await readValidatedBody(event, (val) =>
    payloadSchema.parse(val),
  );

  const body = await $fetch<string>(payload.url);

  return turndownService.turndown(body);
};

const getOpenAi = async (event: H3Event) => {
  const client = await serverSupabaseClient(event);

  const userApiKey = await Settings.using(client).getOpenAiKey();
  if (userApiKey) {
    return new OpenAI({
      apiKey: userApiKey,
    });
  }

  await client.rpc("increase_free_ai_trials").throwOnError();

  return new OpenAI({
    apiKey: process.env.OPENAPI_KEY as string,
  });
};

const extractRecipesFromMarkdown = async (
  openai: OpenAI,
  markdownBody: string,
) => {
  const storage = useStorage("data");

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: (await storage.getItem("prompt.md")) as string,
      },
      { role: "user", content: markdownBody },
    ],
    response_format: zodResponseFormat(responseFormat, "recipe_extraction"),
  });

  const { recipes } = JSON.parse(
    completion.choices[0].message.content!,
  ) as z.infer<typeof responseFormat>;
  return recipes;
};
const addIds = (
  recipes: Awaited<ReturnType<typeof extractRecipesFromMarkdown>>,
) => {
  return recipes.map(
    ({ ingredients, steps, ...recipe }): RecipePayload => ({
      ingredients: ingredients.map((ingredient) => ({
        id: v4(),
        ...("separate" in ingredient
          ? {
              separate: ingredient.separate,
            }
          : {
              name: ingredient.name,
              unit: ingredient.unit,
              notes: ingredient.notes ?? undefined,
              quantity: ingredient.quantity ?? undefined,
            }),
      })),
      steps: steps.map((step) => ({ ...step, id: v4() })),
      tags: [],
      ...recipe,
    }),
  );
};

export default defineEventHandler(async (event) => {
  const markdownBody = await getMarkdownFromUrl(event);

  const openai = await getOpenAi(event);

  const recipes = await extractRecipesFromMarkdown(openai, markdownBody);

  return {
    recipes: addIds(recipes),
  };
});
