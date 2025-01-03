import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "@/types/database.types";
import { slugify } from "~/lib/utils";
import { recipeSchema } from "~/types/recipe";
import { Books } from "~/lib/books";

export default defineEventHandler(async (event) => {
  const bookId = getRouterParam(event, "id")!;

  const payload = await readValidatedBody(event, (val) =>
    recipeSchema.parse(val),
  );
  const client = await serverSupabaseClient<Database>(event);

  const books = Books.using(client);

  const book = await books.getBookById(bookId);

  if (!book) {
    throw createError({ status: 404, statusText: "Book not found" });
  }

  const { error, data: result } = await client
    .from("recipes")
    .insert({
      name: payload.name,
      slug: slugify(payload.name),
      book_id: book.id,
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
