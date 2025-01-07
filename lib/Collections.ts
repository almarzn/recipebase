import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

export class Collections {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async getBySlug(slug: string) {
    const { data } = await this.client
      .from("collections")
      .select(`id, name, created_at, slug`)
      .eq("slug", slug)
      .limit(1)
      .order("created_at");

    return data?.[0];
  }

  async getById(id: string) {
    const { data } = await this.client
      .from("collections")
      .select(`id, name, created_at, slug`)
      .eq("id", id)
      .limit(1)
      .order("created_at");

    return data?.[0];
  }

  static using(client: SupabaseClient) {
    return new Collections(client);
  }
}
