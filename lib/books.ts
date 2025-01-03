import type { SupabaseClient } from "@supabase/supabase-js";

export class Books {
  private constructor(private readonly client: SupabaseClient) {}

  async getBookBySlug(slug: string) {
    const { data } = await this.client
      .from("books")
      .select(`id, name, created_at, slug`)
      .eq("slug", slug)
      .limit(1)
      .order("created_at");

    return data?.[0];
  }

  async getBookById(id: string) {
    const { data } = await this.client
      .from("books")
      .select(`id, name, created_at, slug`)
      .eq("id", id)
      .limit(1)
      .order("created_at");

    return data?.[0];
  }

  static using(client: SupabaseClient) {
    return new Books(client);
  }
}
