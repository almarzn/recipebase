import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;

  const client = await serverSupabaseClient<Database>(event);

  const { error } = await client.from("books").delete().eq("id", id);

  if (error) {
    console.log(error);
    throw createError({
      status: 500,
    });
  }
});
