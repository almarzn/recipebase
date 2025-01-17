import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";
import type { CommentTarget } from "~/types/comment";
import { commentTargetSchema } from "~/types/comment";

export class Comments {
  private constructor(private readonly client: SupabaseClient<Database>) {}

  async findByRecipeId(recipeId: string) {
    const response = await this.client
      .from("comments")
      .select(`id, content, created_at, target`)
      .eq("recipe_id", recipeId)
      .throwOnError();
    return response.data?.map((props) => ({
      id: props.id,
      content: props.content,
      created_at: new Date(props.created_at),
      target: commentTargetSchema.parse(props.target),
    }));
  }

  static using(client: SupabaseClient) {
    return new Comments(client);
  }

  async addComment(props: {
    id: string;
    content: string;
    target: CommentTarget;
    recipe_id: string;
  }) {
    const res = await this.client
      .from("comments")
      .insert({ ...props })
      .select("id")
      .throwOnError();

    return res.data![0].id;
  }
  async updateComment(id: string, content: string) {
    await this.client
      .from("comments")
      .update({ content })
      .eq("id", id)
      .throwOnError();
  }

  async deleteComment(id: string) {
    await this.client.from("comments").delete().eq("id", id).throwOnError();
  }
}
