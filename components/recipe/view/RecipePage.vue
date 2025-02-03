<script setup lang="ts">
import type { RecipeDetailsSaved } from "~/types/recipe";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import RecipeStep from "~/components/recipe/view/RecipeStep.vue";
import RecipeIngredients from "~/components/recipe/view/RecipeIngredients.vue";
import { useComments } from "~/components/recipe/view/useComments";
import {
  breakpointsTailwind,
  debouncedWatch,
  useBreakpoints,
} from "@vueuse/core";
import AdaptiveSheet from "~/components/ui/sheet/AdaptiveSheet.vue";
import { ShoppingBasket, Link } from "lucide-vue-next";

const props = defineProps<{
  hideComments?: true;
  recipe: RecipeDetailsSaved;
}>();

const commentContainer = useTemplateRef("commentContainer");

const recipeId = computed(() => props.recipe.id);

const { commentsForStep, addCommentToStep, updateComment, deleteComment } =
  await useComments(recipeId);

const breakpoints = useBreakpoints(breakpointsTailwind);

const commentLayout = computed(() =>
  breakpoints.greaterOrEqual("lg").value ? "side" : "none",
);

const quantityMultiplier = ref(
  props.recipe.saved.servings ?? props.recipe.servings?.amount ?? 1,
);

const client = useSupabaseClient();

debouncedWatch(
  quantityMultiplier,
  (value) => {
    client
      .from("last_recipe_servings")
      .upsert({
        recipe_id: props.recipe.id,
        value: value,
      })
      .throwOnError()
      .then(() => {});
  },
  {
    debounce: 1000,
  },
);
</script>

<template>
  <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
    <AdaptiveSheet sheet-title="Ingredients" :icon="ShoppingBasket">
      <RecipeIngredients v-model="quantityMultiplier" :recipe />
    </AdaptiveSheet>

    <div
      class="flex grow flex-col gap-6 rounded-xl backdrop-blur-3xl md:border md:p-5 md:shadow-md"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1">
            <RecipeTag v-for="tag in recipe.tags" :key="tag.id" :tag />
          </div>
          <h2 class="heading-2">{{ recipe.name }}</h2>
        </div>
        <p class="text-muted-foreground">{{ recipe.description }}</p>
        <div v-if="recipe.metadata?.original_url">
          <Button size="sm" variant="outline" class="rounded-full" as-child>
            <NuxtLink :to="recipe.metadata?.original_url" target="_blank">
              <Link /> Source
            </NuxtLink>
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <h3 class="heading-3">Steps</h3>

        <ol
          class="ml-6 flex list-decimal flex-col marker:text-muted-foreground"
        >
          <RecipeStep
            v-for="(step, index) in recipe.steps"
            :key="step.id"
            :index="index"
            :step="step"
            :comment-to="!hideComments ? commentContainer : null"
            :comments="commentsForStep(step.id)"
            :comment-layout
            @add-comment="addCommentToStep(step.id)"
            @update-comment="updateComment"
            @delete-comment="deleteComment"
          />
        </ol>
      </div>
    </div>
    <div
      v-if="!hideComments"
      ref="commentContainer"
      class="relative min-w-56 basis-56 max-lg:hidden"
    ></div>
  </div>
</template>
