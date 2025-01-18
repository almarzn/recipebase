<script setup lang="ts">
import type { RecipeDetails } from "~/types/recipe";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import RecipeStep from "~/components/recipe/view/RecipeStep.vue";
import RecipeIngredients from "~/components/recipe/view/RecipeIngredients.vue";
import { useComments } from "~/components/recipe/view/useComments";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const props = defineProps<{
  recipe: RecipeDetails;
}>();

const commentContainer = useTemplateRef("commentContainer");

const recipeId = computed(() => props.recipe.id);

const { commentsForStep, addCommentToStep, updateComment, deleteComment } =
  await useComments(recipeId);

const breakpoints = useBreakpoints(breakpointsTailwind);

const commentLayout = computed(() =>
  breakpoints.greaterOrEqual("lg").value ? "side" : "none",
);
</script>

<template>
  <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
    <RecipeIngredients :recipe />

    <div
      class="flex grow flex-col gap-6 rounded-xl border p-5 shadow-md backdrop-blur-3xl"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1">
            <RecipeTag v-for="tag in recipe.tags" :key="tag.id" :tag />
          </div>
          <h2 class="heading-2">{{ recipe.name }}</h2>
        </div>
        <p class="text-muted-foreground">{{ recipe.description }}</p>
      </div>

      <div class="flex flex-col gap-4">
        <h3 class="heading-3">Steps</h3>

        <ol
          class="ml-6 flex list-decimal flex-col marker:text-muted-foreground"
        >
          <RecipeStep
            v-for="(step, index) in recipe.steps"
            :key="index"
            :step="step"
            :comment-to="commentContainer"
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
      v-if="commentLayout === 'side'"
      ref="commentContainer"
      class="relative min-w-56 basis-56"
    ></div>
  </div>
</template>
