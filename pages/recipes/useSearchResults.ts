import { useRouteQuery } from "@vueuse/router";
import { useDebounceFn } from "@vueuse/core";
import { Recipes } from "~/lib/Recipes";
import type { Database } from "~/types/database.types";

export const useSearchResults = async (rowsPerPage: number) => {
  const client = useSupabaseClient<Database>();

  const tags = useRouteQuery<string | string[], string[]>("tags", [], {
    transform: (el) => ([] as string[]).concat(el),
  });

  const text = useRouteQuery("text", "", {
    transform: String,
  });

  const currentPage = useRouteQuery("page", 1, {
    transform: Number,
  });

  const { data: recipes, status } = await useAsyncData(
    "searchResults",
    useDebounceFn(() => {
      return Recipes.using(client).findAllWithTags(
        {
          tags: (tags.value?.length ?? 0) > 0 ? tags.value : undefined,
          text: (text.value?.length ?? 0) > 0 ? text.value : undefined,
        },
        {
          page: currentPage.value - 1,
          rowsPerPage,
        },
      );
    }, 500),
    {
      lazy: true,
      watch: [tags, text, currentPage],
    },
  );
  return { tags, text, currentPage, recipes, status };
};
