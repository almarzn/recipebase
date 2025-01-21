<script setup lang="ts">
import { CookingPot, Plus } from "lucide-vue-next";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import type { ManyRecipeWithTags } from "~/lib/Recipes";

defineProps<{
  recipes: ManyRecipeWithTags[] | null;
}>();
</script>

<template>
  <div
    v-if="!recipes || recipes?.length === 0"
    class="flex items-center gap-8 self-center"
  >
    <CookingPot :size="64" class="stroke-muted-foreground" />
    <div class="flex max-w-96 flex-col items-start gap-4 self-center">
      <div class="flex flex-col gap-1">
        <h4 class="heading-4">No recipe created yet</h4>
        <p class="text-muted-foreground">
          Create a new recipe to view it here.
        </p>
      </div>
      <Button variant="outline">
        <Plus />
        Create recipe
      </Button>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-stretch gap-2 self-stretch backdrop-blur-3xl"
  >
    <NuxtLink
      v-for="recipe in recipes"
      :key="recipe.id"
      :to="{
        name: 'recipes-slug',
        params: { slug: recipe.slug },
      }"
      class="flex flex-col gap-2 rounded-md border px-6 py-5"
    >
      <div class="flex flex-col">
        <div class="font-medium">{{ recipe.name }}</div>
        <div class="text-xs text-muted-foreground">
          {{ recipe.description }}
        </div>
      </div>
      <div v-if="recipe.tags?.length > 0" class="flex flex-wrap gap-2">
        <RecipeTag v-for="tag in recipe.tags" :key="tag.id" :tag />
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped></style>
