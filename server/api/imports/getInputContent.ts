import { z } from "zod";
import TurndownService from "turndown";
import type { H3Event } from "h3";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";

const payloadSchema = z
  .object({
    url: z.string().url(),
  })
  .or(
    z.object({
      text: z.string(),
    }),
  );
export const turndownService = new TurndownService({
  linkStyle: "plain" as "inlined",
});

turndownService.remove("nav");
turndownService.remove("meta");
turndownService.remove("footer");
turndownService.remove("header");
turndownService.remove("button");
turndownService.remove("img");
turndownService.remove("video");
turndownService.remove("head");
turndownService.remove("script");
turndownService.remove("noscript");
turndownService.remove("style");
turndownService.addRule("striplinks", {
  filter: "a",
  replacement: (content) => {
    return content;
  },
});
turndownService.rules.array.splice(
  turndownService.rules.array.findIndex((el) => el.filter === "img"),
);

export const getInputContent = async (
  event: H3Event,
): Promise<ChatCompletionContentPart> => {
  if (
    getRequestHeader(event, "content-type")?.startsWith("multipart/form-data")
  ) {
    const [file] = (await readMultipartFormData(event))!;

    if (file.data.length > 5_000_000) {
      throw new Error("Max file size 5MB");
    }

    if (file.name !== "image") {
      throw new Error("Can only form data image");
    }

    return {
      type: "image_url",
      image_url: {
        url: `data:${file.type};base64,` + file.data.toString("base64"),
      },
    };
  }

  const payload = await readValidatedBody(event, (data) =>
    payloadSchema.parse(data),
  );

  if ("text" in payload) {
    return {
      type: "text",
      text: payload.text,
    };
  }

  const body = await $fetch<string>(payload.url);

  return {
    type: "text",
    text: turndownService.turndown(body),
  };
};
