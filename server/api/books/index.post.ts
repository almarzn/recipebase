import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "@/types/database.types";
import { createHandbook } from "~/types/handbook";
import { slugify } from "~/lib/utils";

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, (val) =>
    createHandbook.parse(val),
  );
  const client = await serverSupabaseClient<Database>(event);

  const { error } = await client.from("books").insert({
    name: data.name,
    slug: slugify(data.name),
  });

  if (error) {
    console.log(error);
    throw createError({
      status: 500,
    });
  }
});
