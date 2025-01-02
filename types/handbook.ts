import { z } from "zod";

export const createHandbook = z.object({
  name: z.string().nonempty(),
});
