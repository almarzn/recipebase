<template>
  <page-layout>
    <div class="flex items-center justify-between">
      <adaptive-breadcrumbs
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
            text: status === 'success' ? (recipe?.name ?? '') : '',
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
          <span>
            Edit
            <span class="hidden md:inline">recipe</span>
          </span>
        </Button>
      </NuxtLink>
    </div>

    <RecipePage v-if="status === 'success' && recipe" :recipe />

    <RecipePageSkeleton v-if="status === 'pending'" />

    <error-status v-if="error" />
  </page-layout>
</template>

<script setup lang="ts">
import PageLayout from "~/components/layout/PageLayout.vue";
import { RecipePage } from "~/components/recipe/view";
import { Recipes } from "~/lib/Recipes";
import { ErrorStatus } from "~/components/ui/status";
import { AdaptiveBreadcrumbs } from "~/components/layout";
import { Pencil } from "lucide-vue-next";
import RecipePageSkeleton from "~/components/recipe/view/RecipePageSkeleton.vue";

const route = useRoute("recipes-slug");
const client = useSupabaseClient();
const recipeSlug = computed(() => route.params.slug);
const {
  data: recipe,
  status,
  error,
} = await useAsyncData(
  async () => {
    return Recipes.using(client).getBySlugWithTags(recipeSlug.value);
  },
  {
    watch: [recipeSlug],
    lazy: true,
    server: true,
  },
);

if (error.value) {
  console.error(error.value);
}
</script>
