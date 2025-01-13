import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { ingredientUnitSchema } from "~/types/recipe";
import TurndownService from "turndown";

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

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY as string,
});

export default defineEventHandler(async (event) => {
  const payload = await readValidatedBody(event, (val) =>
    payloadSchema.parse(val),
  );

  const body = await $fetch<string>(payload.url);

  const markdownBody = turndownService.turndown(body);

  console.log(markdownBody);

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert at structured data extraction and at cooking. You will be given an unstructured webpage containing one or more recipe, and should convert them into structured data. Make sure to return every recipe on the page in a different object. Return an empty array if there are no recipe on the webpage. Keep the original language. Make sure that each step is written in a natural order, and only contain one instruction. Rewrite them if necessary. For the description field, remove any information related to do original support, and only return the recipe, what it is and how to execute it correctly. Remove any useless blabla. Always strip the title from useless informations, such as 'How to'and such.",
      },
      { role: "user", content: markdownBody },
    ],
    response_format: zodResponseFormat(
      z.object({
        recipes: z.array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            ingredients: z.array(
              z.object({
                name: z.string(),
                quantity: z.number().or(z.null()),
                unit: ingredientUnitSchema,
                notes: z.string().optional(),
              }),
            ),
            steps: z.array(
              z.object({
                text: z.string(),
                notes: z.string().optional(),
              }),
            ),
          }),
        ),
      }),
      "recipe_extraction",
    ),
  });

  return JSON.parse(completion.choices[0].message.content!);
});
