import { z } from "zod";

export const commentTargetSchema = z
  .object({
    step: z.string().uuid(),
  })
  .or(
    z.object({
      ingredient: z.string().uuid(),
    }),
  )
  .optional();

export type CommentTarget = z.infer<typeof commentTargetSchema>;

export const commentPayloadSchema = z.object({
  content: z.string(),
  recipe_id: z.string().uuid(),
  target: commentTargetSchema,
});

export type CommentPayload = z.infer<typeof commentPayloadSchema>;

export const recipeComment = commentPayloadSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().transform(Date),
});

export type RecipeComment = z.infer<typeof recipeComment>;
