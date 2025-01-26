import { z } from "zod";

export type SourceValue = {
  url: string;
  text: string;
  image: null | File;
  current: "url" | "text" | "image";
};

export const sourceSchema = z
  .object({
    url: z.string().url(),
    current: z.literal("url"),
  })
  .or(
    z.object({
      text: z.string().min(3),
      current: z.literal("text"),
    }),
  )
  .or(
    z.object({
      image: z
        .instanceof(File)
        .refine((el) => el.size < 5_000_000, "Maximum image size is 5MB"),
      current: z.literal("image"),
    }),
  );
