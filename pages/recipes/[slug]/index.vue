<template>
  <page-layout>
    <div class="flex items-center justify-between">
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
            text: recipe?.name,
          },
        ]"
      />
      <NuxtLink
        :to="{
          name: 'recipes-slug-edit',
          params: { slug: recipeSlug },
        }"
      >
        <Button variant="secondary" class="rounded-full">
          <pencil />
          Edit recipe
        </Button>
      </NuxtLink>
    </div>
    <recipe-page v-if="recipe" :recipe />
    <error-status v-if="error" />
  </page-layout>
</template>
<script setup lang="ts">
import PageLayout from "~/components/layout/PageLayout.vue";
import { RecipePage } from "~/components/recipe/view";
import { Recipes } from "~/lib/Recipes";
import { ErrorStatus } from "~/components/ui/status";
import { Breadcrumbs } from "~/components/layout";
import { Pencil } from "lucide-vue-next";

const route = useRoute("recipes-slug");
const client = useSupabaseClient();
const recipeSlug = computed(() => route.params.slug);
const { data: recipe, error } = await useAsyncData(
  async () => {
    return Recipes.using(client).getBySlug(recipeSlug.value);
  },
  {
    watch: [recipeSlug],
  },
);
</script>
