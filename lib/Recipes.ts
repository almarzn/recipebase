import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import type { RecipeDetails, RecipePayload, TagProps } from "~/types/recipe";
import {
  ingredientFieldSchema,
  servingsSchema,
  stepSchema,
} from "~/types/recipe";
import { slugify } from "~/lib/utils";
import { z } from "zod";
import { omit } from "lodash";

export interface RecipeQuery {
  tags?: string[];
  text?: string;
}

export type ManyRecipeWithTags = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: TagProps[];
};

export class Recipes {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async lastRecipes() {
    const response = await this.client
      .from("recipes")
      .select("id, slug, name, tags(id, icon, color, text)")
      .order("created_at", { ascending: false })
      .limit(5)
      .throwOnError();

    return response.data ?? [];
  }

  async findAllRecipeItems() {
    const response = await this.client
      .from("recipes")
      .select("id, slug, name")
      .throwOnError();

    return response.data ?? [];
  }

  async findAllWithTags(
    query: RecipeQuery = {},
  ): Promise<ManyRecipeWithTags[] | null> {
    const response = await this.client
      .rpc("get_recipes", {
        tags: query.tags ?? [],
        text: query.text ?? "",
      })
      .throwOnError();

    return response.data as ManyRecipeWithTags[];
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
      .select("*, tags(id)")
      .eq("slug", slug);

    if (!data || data?.length === 0) {
      return null;
    }

    const result = data[0];

    return {
      id: result.id,
      name: result.name,
      steps: z.array(stepSchema).parse(result.steps ?? []),
      ingredients: ingredientFieldSchema.parse(result.ingredients ?? []),
      description: result.description ?? undefined,
      tags: result.tags.map((it) => it.id),
      servings: result.servings ? servingsSchema.parse(result.servings) : null,
    };
  }

  async getBySlugWithTags(slug: string): Promise<RecipeDetails | null> {
    const { data } = await this.client
      .from("recipes")
      .select("*, tags(id, text, color, icon)")
      .eq("slug", slug);

    if (!data || data?.length === 0) {
      return null;
    }

    const result = data[0];

    return {
      id: result.id,
      name: result.name,
      steps: z.array(stepSchema).parse(result.steps ?? []),
      ingredients: ingredientFieldSchema.parse(result.ingredients ?? []),
      description: result.description ?? undefined,
      servings: servingsSchema.or(z.null()).parse(result.servings),
      tags: result.tags,
    };
  }

  static using(client: SupabaseClient) {
    return new Recipes(client);
  }

  async updateById(id: string, props: Partial<RecipePayload>) {
    await this.client
      .from("recipes")
      .update(omit(props, ["tags"]))
      .eq("id", id)
      .throwOnError();

    await this.updateTags(id, props);
  }

  private async updateTags(id: string, props: Partial<RecipePayload>) {
    if (!props.tags) {
      return;
    }

    await this.client
      .from("recipe_tags")
      .delete()
      .eq("recipe_id", id)
      .throwOnError();

    for (const tag of props.tags) {
      await this.client
        .from("recipe_tags")
        .insert({
          recipe_id: id,
          tag_id: tag,
        })
        .throwOnError();
    }
  }

  async create(props: RecipePayload) {
    await this.client.from("recipes").insert({
      name: props.name,
      slug: slugify(props.name),
      description: props.description,
      steps: props.steps,
      ingredients: props.ingredients,
      servings: props.servings,
    });
  }
}
