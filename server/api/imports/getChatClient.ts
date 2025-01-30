import type { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import { Settings } from "~/lib/Settings";
import OpenAI from "openai";
import type { z } from "zod";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { zodResponseFormat } from "openai/helpers/zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

const getOpenAi = async (
  userApiKey: string | null,
  client: SupabaseClient<Database>,
) => {
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

export type ChatClient = <T extends object>(
  prompt: string,
  schema: z.Schema<T>,
) => (content: ChatCompletionMessageParam[]) => Promise<T>;

const defaultModel = "gpt-4o-mini";

export const getChatClient = async (event: H3Event): Promise<ChatClient> => {
  const client = await serverSupabaseClient(event);

  const userApiKey = await Settings.using(client).getOpenAiKey();
  const openai = await getOpenAi(userApiKey, client);

  const model = userApiKey
    ? ((getQuery(event).model as string) ?? defaultModel)
    : defaultModel;

  return (prompt, schema) => async (messages) => {
    const completion = await openai.beta.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        ...messages,
      ],
      response_format: zodResponseFormat(schema, "recipe_extraction"),
    });

    const parsed = JSON.parse(completion.choices[0].message.content!);

    return schema.parse(parsed);
  };
};
