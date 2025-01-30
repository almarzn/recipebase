<template>
  <div class="flex flex-col gap-4 p-4">
    <h3 class="heading-3 max-md:hidden">Welcome to recipebase 👋</h3>
    <SearchRecipe
      class="h-auto self-center px-4 py-2 shadow-xl max-md:self-stretch md:w-80"
    />

    <div class="flex flex-col gap-4">
      <h4 class="heading-4">Latest recipes</h4>

      <div class="overflow-x-auto">
        <div class="flex w-max gap-4">
          <template v-if="latestRecipes.status.value === 'pending'">
            <div class="flex flex-col gap-2 rounded-md border px-5 py-4">
              <div class="skeleton-h5 w-32 skeleton-1" />
              <ul class="flex gap-1">
                <li class="m-1 size-3 skeleton-2 rounded-full"></li>
                <li class="m-1 size-3 skeleton-2 rounded-full"></li>
                <li class="m-1 size-3 skeleton-3 rounded-full"></li>
              </ul>
            </div>
            <div class="flex flex-col gap-2 rounded-md border px-5 py-4">
              <div class="skeleton-h5 w-44 skeleton-1" />
              <ul class="flex gap-1">
                <li class="m-1 size-3 skeleton-3 rounded-full"></li>
                <li class="m-1 size-3 skeleton-2 rounded-full"></li>
              </ul>
            </div>
          </template>
          <template v-if="latestRecipes.status.value === 'success'">
            <NuxtLink
              v-for="recipe in latestRecipes.data.value"
              :key="recipe.id"
              class="flex max-w-56 flex-col gap-2 rounded-md border px-5 py-4 hover:bg-gray-900"
              :to="{ name: 'recipes-slug', params: { slug: recipe.slug } }"
            >
              <h5 class="text-sm text-muted-foreground">
                {{ recipe.name }}
              </h5>
              <ul class="flex gap-1">
                <li
                  v-for="tag in recipe.tags"
                  :key="tag.id"
                  class="inline"
                  :style="`color: ${colors[tag.color]?.['700']}`"
                >
                  <TagIcon class="size-4" :tag />
                </li>
              </ul>
            </NuxtLink>
          </template>
        </div>
      </div>

      <NuxtLink to="/recipes" class="md:self-start">
        <Button class="w-full" variant="secondary">
          All recipes <ChevronRight class="size-4" />
        </Button>
      </NuxtLink>
    </div>

    <div class="flex flex-col gap-4">
      <h4 class="heading-4">Add a new recipe</h4>

      <div class="grid place-items-stretch gap-3 md:grid-cols-3">
        <Button
          class="flex h-auto items-center gap-3 px-5 py-3 text-start whitespace-normal"
          variant="outline"
          as-child
        >
          <NuxtLink to="/import">
            <TabletSmartphone />
            <div class="flex flex-col">
              <h5>Import a recipe from webpage</h5>
              <p class="text-xs text-muted-foreground">
                Create a new recipe by importing it from any webpage. Recipebase
                will extract the details and add them right here!
              </p>
            </div>
          </NuxtLink>
        </Button>
        <Button
          class="flex h-auto items-center gap-3 px-5 py-3 text-start whitespace-normal"
          variant="outline"
          as-child
        >
          <NuxtLink to="/import">
            <BookImage />
            <div class="flex grow flex-col">
              <h5>Import a recipe from a picture</h5>
              <p class="text-xs text-muted-foreground">
                Found an awesome recipe in a book? Just take a picture and
                import it into your recipes!
              </p>
            </div>
          </NuxtLink>
        </Button>
        <Button
          class="flex h-auto items-center gap-3 px-5 py-3 text-start whitespace-normal"
          variant="outline"
          as-child
        >
          <NuxtLink to="/create-recipe">
            <PencilLine />
            <div class="flex grow flex-col">
              <h5>Create a new recipe step-by-step</h5>
              <p class="text-xs text-muted-foreground">
                Have a recipe in your mind? Create it by following our
                user-friendly wizard.
              </p>
            </div>
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import colors from "tailwindcss/colors";
import SearchRecipe from "~/components/recipe/SearchRecipe.vue";
import {
  ChevronRight,
  TabletSmartphone,
  BookImage,
  PencilLine,
} from "lucide-vue-next";
import TagIcon from "~/components/recipe/TagIcon.vue";
import { Recipes } from "~/lib/Recipes";

const client = useSupabaseClient();

const latestRecipes = await useAsyncData(
  async () => await Recipes.using(client).lastRecipes(),
  { lazy: true },
);

useHead({
  title: "Welcome",
});
</script>
