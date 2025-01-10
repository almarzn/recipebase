import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

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

  static using(client: SupabaseClient) {
    return new Tags(client);
  }
}
