import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { slugify } from "~/lib/utils";
import { recipePayload } from "~/types/recipe";

export default defineEventHandler(async (event) => {
  const payload = await readValidatedBody(event, (val) =>
    recipePayload.parse(val),
  );
  const client = await serverSupabaseClient<Database>(event);

  const { error, data: result } = await client
    .from("recipes")
    .insert({
      name: payload.name,
      slug: slugify(payload.name),
      description: payload.description,
      ingredients: payload.ingredients,
      steps: payload.steps,
    })
    .select("id, slug");

  if (error) {
    console.log(error);
    throw createError({
      status: 500,
    });
  }

  for (const tag of payload.tags) {
    await client.from("recipe_tags").insert({
      recipe_id: result[0].id,
      tag_id: tag,
    });
  }

  return {
    id: result[0].id,
    slug: result[0].slug,
  };
});
