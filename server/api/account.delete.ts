import {serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser} from "#supabase/server";
import { log } from "effect/Console";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const service = serverSupabaseServiceRole<Database>(event);

  const result = await service.auth.admin.deleteUser(user!.id!, false)

  if (result.error) {
    console.error(result.error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete user",
    });
  }

  return { message: "User deleted successfully" };
});
