import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { slugify } from "~/lib/utils";
import { recipeSchema } from "~/types/recipe";

export default defineEventHandler(async (event) => {
  const payload = await readValidatedBody(event, (val) =>
    recipeSchema.parse(val),
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

  return {
    id: result[0].id,
    slug: result[0].slug,
  };
});
