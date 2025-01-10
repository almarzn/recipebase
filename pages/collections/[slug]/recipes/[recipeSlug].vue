<script setup lang="ts">
import { Recipes } from "~/lib/Recipes";
import { RecipePage } from "~/components/recipe/view";
import PageLayout from "~/components/layout/PageLayout.vue";
import { useCurrentCollection } from "~/composables/useCurrentCollection";

const route = useRoute("collections-slug-recipes-recipeSlug");
const client = useSupabaseClient();
const recipeSlug = computed(() => route.params.slug);
const book = await useCurrentCollection();
const { data: recipe, error } = await useAsyncData(
  async () => {
    return Recipes.using(client).getBySlugWithTags(recipeSlug.value);
  },
  {
    watch: [recipeSlug],
  },
);
</script>

<template>
  <PageLayout
    :title="recipe?.name"
    :breadcrumbs="[
      {
        text: 'Collections',
        to: { name: 'books' },
      },
      {
        text: book?.name,
        to: { name: 'books-slug', params: { slug: book?.slug } },
      },
      {
        text: recipe?.name,
      },
    ]"
  >
    <RecipePage v-if="recipe" :recipe />
  </PageLayout>
</template>
