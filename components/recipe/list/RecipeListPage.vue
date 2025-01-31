<script setup lang="ts">
import { CookingPot, Plus } from "lucide-vue-next";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import type { ManyRecipeWithTags } from "~/lib/Recipes";
import type { TagProps } from "~/types/recipe";
import { keyBy } from "lodash";

const props = defineProps<{
  recipes: ManyRecipeWithTags[] | null;
  allTags: TagProps[] | null;
  loading?: boolean;
}>();

const tagsById = computed(() => {
  const newVar = props.allTags ? keyBy(props.allTags, "id") : null;
  console.log(props.allTags, newVar);
  return newVar;
});
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
    class="flex flex-col items-stretch gap-2 self-stretch backdrop-blur-3xl data-[loading=true]:opacity-50 data-[loading=true]:pointer-events-none transition-opacity"
    :data-loading="loading"
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
      <div v-if="recipe.tag_ids?.length > 0" class="flex flex-wrap gap-2">
        <template v-for="(tag, index) in recipe.tag_ids" :key="index">
          <RecipeTag v-if="tagsById !== null" :tag="tagsById[tag]" />

          <div v-else class="h-[22px] w-20 skeleton-3 rounded-sm"></div>
        </template>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped></style>
