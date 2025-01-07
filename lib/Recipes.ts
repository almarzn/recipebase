import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import type { Recipe } from "~/types/recipe";
import { existingRecipeSchema, recipeSchema } from "~/types/recipe";

export class Recipes {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll() {
    const { data, error } = await this.client
      .from("recipes")
      .select(`*`)
      .order("created_at");

    if (error) {
      throw error;
    }

    return data;
  }

  async findAllByCollectionId(collectionId: string) {
    const { data, error } = await this.client
      .from("recipes")
      .select(`*, collections_recipes!inner(collection_id)`)
      .eq("collections_recipes.collection_id", collectionId)
      .order("created_at");

    if (error) {
      throw error;
    }

    return data?.map((el) => ({
      ...el,
    }));
  }

  async getRecipeSlugs() {
    const { data } = await this.client
      .from("recipes")
      .select(`slug`)
      .order("created_at");

    return data?.map((it) => it.slug);
  }

  async getBySlug(slug: string) {
    const { data } = await this.client
      .from("recipes")
      .select()
      .eq("slug", slug);

    if (!data || data?.length === 0) {
      return null;
    }

    const result = data[0];

    return existingRecipeSchema.parse({
      id: result.id,
      name: result.name,
      steps: result.steps ?? [],
      ingredients: result.ingredients ?? [],
      description: result.description ?? undefined,
    });
  }

  static using(client: SupabaseClient) {
    return new Recipes(client);
  }

  async updateById(id: string, props: Partial<Recipe>) {
    await this.client.from("recipes").update(props).eq("id", id);
  }
}
