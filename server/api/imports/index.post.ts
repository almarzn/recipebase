import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import type { RecipePayload } from "~/types/recipe";
import { ingredientUnitSchema } from "~/types/recipe";
import TurndownService from "turndown";
import { v4 } from "uuid";
import type { H3Event } from "h3";
import { Settings } from "~/lib/Settings";
import { serverSupabaseClient } from "#supabase/server";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";

const payloadSchema = z
  .object({
    url: z.string().url(),
  })
  .or(
    z.object({
      text: z.string(),
    }),
  );

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
      servings: z.object({
        amount: z.number(),
        notes: z.string().or(z.null()),
      }),
      steps: z.array(
        z.object({
          text: z.string(),
          notes: z.string().optional(),
        }),
      ),
    }),
  ),
});

const getInputContent = async (
  event: H3Event,
): Promise<ChatCompletionContentPart> => {
  if (
    getRequestHeader(event, "content-type")?.startsWith("multipart/form-data")
  ) {
    const [file] = (await readMultipartFormData(event))!;

    if (file.data.length > 5_000_000) {
      throw new Error("Max file size 5MB");
    }

    if (file.name !== "image") {
      throw new Error("Can only form data image");
    }

    return {
      type: "image_url",
      image_url: {
        url: `data:${file.type};base64,` + file.data.toString("base64"),
      },
    };
  }

  const payload = await readValidatedBody(event, (data) =>
    payloadSchema.parse(data),
  );

  if ("text" in payload) {
    return {
      type: "text",
      text: payload.text,
    };
  }

  const body = await $fetch<string>(payload.url);

  return {
    type: "text",
    text: turndownService.turndown(body),
  };
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

const extractRecipes = async (
  openai: OpenAI,
  model: string,
  content: ChatCompletionContentPart,
) => {
  const storage = useStorage("data");

  const completion = await openai.beta.chat.completions.parse({
    model,
    messages: [
      {
        role: "system",
        content: (await storage.getItem("prompt.md")) as string,
      },
      { role: "user", content: [content] },
    ],
    response_format: zodResponseFormat(responseFormat, "recipe_extraction"),
  });

  const { recipes } = JSON.parse(
    completion.choices[0].message.content!,
  ) as z.infer<typeof responseFormat>;

  return recipes;
};

const addIds = (recipes: Awaited<ReturnType<typeof extractRecipes>>) => {
  return recipes.map(
    ({ ingredients, steps, servings, ...recipe }): RecipePayload => ({
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
      servings: {
        amount: servings.amount,
        notes: servings.notes ?? undefined,
      },
      ...recipe,
    }),
  );
};

export default defineEventHandler(async (event) => {
  const content = await getInputContent(event);

  const openai = await getOpenAi(event);

  const recipes = await extractRecipes(
    openai,
    getQuery(event).model ?? "gpt-4o-mini",
    content,
  );

  return {
    recipes: addIds(recipes),
  };
});
