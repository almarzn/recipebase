import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import { z } from "zod";
import { pipe, Array, Record } from "effect";

export type SettingKeys = Database["public"]["Enums"]["profile_settings"];

export const settingsSchema = z.object({
  openai_api_key: z
    .string()
    .startsWith("sk-", "API key should start with sk-")
    .optional(),
});

export class Settings {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  static using(client: SupabaseClient) {
    return new Settings(client);
  }

  async getOpenAiKey() {
    const single = this.client
      .from("settings")
      .select()
      .eq("key", "openai_api_key")
      .throwOnError()
      .maybeSingle();

    return (await single).data?.value as string | null;
  }

  async getSettings() {
    const response = await this.client.from("settings").select().throwOnError();
    if (!response.data) {
      return {};
    }
    return pipe(
      response.data,
      Array.groupBy((el) => el.key),
      Record.map((el) => el[0].value),
      settingsSchema.parse,
    );
  }

  async updateSettings(settings: Partial<z.infer<typeof settingsSchema>>) {
    for (const settingKey in settings) {
      await this.client
        .from("settings")
        .upsert({
          key: settingKey as SettingKeys,
          value: settings[settingKey as keyof typeof settings],
        })
        .throwOnError();
    }
  }
}
