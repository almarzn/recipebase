<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { Recipes } from "~/lib/Recipes";
import { useSupabaseClient } from "#imports";
import PageLayout from "~/components/layout/PageLayout.vue";
import EditPage from "~/components/recipe/wizard/EditPage.vue";
import { Breadcrumbs } from "~/components/layout";

const route = useRoute("recipes-slug-edit");

const client = useSupabaseClient<Database>();

const recipe = await useAsyncData(() =>
  Recipes.using(client).getBySlug(route.params.slug),
);
</script>

<template>
  <PageLayout>
    <breadcrumbs
      :items="[
        {
          text: 'Home',
          to: { name: 'index' },
        },
        {
          text: 'Recipes',
          to: { name: 'recipes' },
        },
        {
          text: recipe.data.value?.name ?? '',
          to: { name: 'recipes-slug', params: { slug: route.params.slug } },
        },
        {
          text: 'Edit',
        },
      ]"
    />
    <template v-if="recipe">
      <EditPage :recipe="recipe.data.value!" />
    </template>
  </PageLayout>
</template>
