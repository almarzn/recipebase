import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import { head } from "lodash";

export class Tags {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll() {
    const { data, error } = await this.client
      .from("tags")
      .select(`id, text, color, icon`);

    if (error) {
      throw error;
    }

    return data;
  }

  async findAllWithRecipeCount() {
    const results = await this.client
      .from("tags")
      .select(`id, text, color, icon, recipes(count)`, { count: "estimated" })
      .throwOnError();

    return results.data?.map((result) => ({
      ...result,
      recipes: head(result.recipes)?.count,
    }));
  }

  static using(client: SupabaseClient) {
    return new Tags(client);
  }
}
