import type { RecipePayload } from "~/types/recipe";
import type { SourceValue } from "~/components/recipe/import/SourceValue";

type Response = { recipes: RecipePayload[] };

export const useExtraction = (
  modelRef: Ref<string | undefined>,
  sourceValue: Ref<SourceValue>,
) => {
  return useAsyncData(
    async () => {
      const model = modelRef.value;
      if (sourceValue.value.current === "image") {
        const body = new FormData();
        body.set("image", sourceValue.value.image!);

        return $fetch<Response>("/api/imports", {
          method: "post",
          body: body,
          query: { model },
        });
      }

      if (sourceValue.value.current === "text") {
        return $fetch<Response>("/api/imports", {
          method: "post",
          body: {
            text: sourceValue.value.text,
            query: { model },
          },
        });
      }

      return $fetch<Response>("/api/imports", {
        method: "post",
        body: {
          url: sourceValue.value.url,
          query: { model },
        },
      });
    },
    {
      immediate: false,
    },
  );
};
