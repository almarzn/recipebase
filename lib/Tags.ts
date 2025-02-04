import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import { head } from "lodash-es";
import type { TagProps } from "~/types/recipe";

export class Tags {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll() {
    const { data } = await this.client
      .from("tags")
      .select(`id, text, color, icon, user_id`)
      .order("created_at")
      .throwOnError();

    return data;
  }

  async findAllWithRecipeCount() {
    const results = await this.client
      .from("tags")
      .select(`id, text, color, icon, recipes(count)`, { count: "estimated" })
      .order("created_at")
      .throwOnError();

    return results.data?.map((result) => ({
      ...result,
      recipes: head(result.recipes)?.count,
    }));
  }

  async createTag(props: TagProps) {
    await this.client.from("tags").insert(props).throwOnError();
  }

  async updateTag(id: string, props: Partial<TagProps>) {
    await this.client.from("tags").update(props).eq("id", id).throwOnError();
  }

  async deleteTag(id: string) {
    await this.client.from("tags").delete().eq("id", id).throwOnError();
  }

  static using(client: SupabaseClient) {
    return new Tags(client);
  }
}
