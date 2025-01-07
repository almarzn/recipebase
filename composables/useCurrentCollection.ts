import type { Database } from "~/types/database.types";
import { Collections } from "~/lib/Collections";

export const useCurrentCollection = async () => {
  const client = useSupabaseClient<Database>();
  const route = useRoute();
  const slug = computed(() => route.params.slug as string);

  const { data: collection } = await useAsyncData(
    "currentCollection",
    () => Collections.using(client).getBySlug(slug.value),
    { watch: [slug] },
  );

  return collection;
};
