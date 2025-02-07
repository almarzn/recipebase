import type { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import {
  metadataSchema,
  type RecipeDetailsSaved,
  type RecipePayload,
} from "~/types/recipe";
import {
  ingredientFieldSchema,
  servingsSchema,
  stepSchema,
} from "~/types/recipe";
import { slugify } from "~/lib/utils";
import { z } from "zod";
import { head, omit } from "lodash";

export interface RecipeQuery {
  tags?: string[];
  text?: string;
}

export type ManyRecipeWithTags = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tag_ids: string[];
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
    pagination: {
      page: number;
      rowsPerPage: number;
    },
  ) {
    let builder = this.client
      .from("recipes_with_tags")
      .select("id, name, description, slug, tag_ids", {
        count: pagination.page > 0 ? "exact" : "estimated",
      });

    if (query.tags && query.tags.length > 0)
      builder = builder.overlaps("tag_ids", query.tags);
    if (query.text) builder = builder.textSearch("text", query.text);

    const result = await builder
      .range(
        pagination.page * pagination.rowsPerPage,
        (pagination.page + 1) * pagination.rowsPerPage - 1,
      )
      .throwOnError();

    return result as PostgrestResponse<ManyRecipeWithTags>;
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

  async getBySlugWithTags(slug: string): Promise<RecipeDetailsSaved | null> {
    const { data: result } = await this.client
      .from("recipes")
      .select("*, tags(id, text, color, icon), last_recipe_servings(value)")
      .eq("slug", slug)
      .throwOnError()
      .maybeSingle();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      steps: z.array(stepSchema).parse(result.steps ?? []),
      ingredients: ingredientFieldSchema.parse(result.ingredients ?? []),
      description: result.description ?? undefined,
      servings: servingsSchema.or(z.null()).parse(result.servings),
      tags: result.tags,
      saved: {
        servings: head(result.last_recipe_servings)?.value ?? undefined,
      },
      metadata: metadataSchema.parse(result.metadata),
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
    await this.client
      .from("recipes")
      .insert({
        name: props.name,
        slug: slugify(props.name),
        description: props.description,
        steps: props.steps,
        ingredients: props.ingredients,
        servings: props.servings,
        metadata: props.metadata,
      })
      .throwOnError();

    return slugify(props.name);
  }

  async deleteById(id: string) {
    await this.client.from("recipes").delete().eq("id", id).throwOnError();
  }
}
