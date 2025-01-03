import type { Database } from "~/types/database.types";
import { Books } from "~/lib/books";

export const useCurrentBook = async () => {
  const client = useSupabaseClient<Database>();
  const route = useRoute();
  const slug = computed(() => route.params.slug as string);

  const { data: book } = await useAsyncData(
    "currentBook",
    () => Books.using(client).getBookBySlug(slug.value),
    { watch: [slug] },
  );

  return book;
};
