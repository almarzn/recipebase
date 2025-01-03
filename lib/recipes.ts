import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

export class Recipes {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async getRecipesByBookId(bookId: string) {
    const { data } = await this.client
      .from("recipes")
      .select(`id, name, created_at, slug`)
      .eq("book_id", bookId)
      .order("created_at");

    return data;
  }

  static using(client: SupabaseClient) {
    return new Recipes(client);
  }
}
