<script setup lang="ts">
import type { RecipeDetails } from "~/types/recipe";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import { UnitFormatter } from "~/lib/Unit";
import RecipeStep from "~/components/recipe/view/RecipeStep.vue";
import { v4 } from "uuid";
import { Comments } from "~/lib/Comments";
import type { CommentTarget } from "~/types/comment";
import { toast } from "vue-sonner";

const props = defineProps<{
  recipe: RecipeDetails;
}>();

const formatter = new UnitFormatter({
  style: "short",
});

const commentContainer = useTemplateRef("commentContainer");

const client = useSupabaseClient();

const recipeId = computed(() => props.recipe.id);

const comments = await useAsyncData(
  "recipeComments",
  () => Comments.using(client).findByRecipeId(recipeId.value),
  {
    lazy: true,
    watch: [recipeId],
  },
);

const optimisticComments = ref<
  {
    id: string;
    target: CommentTarget;
    created_at: Date;
    content: string;
    isNew: true;
  }[]
>([]);

const optimisticRemoved = ref<string[]>([]);

const commentsForStep = (stepId: string) => {
  const commentsValue = comments.data.value ?? [];
  const allComments = [
    ...commentsValue,
    ...optimisticComments.value.filter(
      (el) => !commentsValue.find((it) => it.id === el.id),
    ),
  ].filter((el) => !optimisticRemoved.value?.includes(el.id));

  return allComments.filter((el) => {
    const target = el.target;
    return target && "step" in target && target.step === stepId;
  });
};

const addCommentToStep = (stepId: string) => {
  const id = v4();

  Comments.using(client)
    .addComment({
      id: id,
      target: { step: stepId },
      recipe_id: recipeId.value,
      content: "",
    })
    .catch(() => {
      toast.error("Unable to add comment, try again later.");
    });

  return (optimisticComments.value = [
    ...optimisticComments.value,
    {
      id: id,
      target: { step: stepId },
      content: "",
      created_at: new Date(),
      isNew: true,
    },
  ]);
};

const updateComment = async (id: string, value: string) => {
  Comments.using(client)
    .updateComment(id, value)
    .finally(() => {
      refreshNuxtData("recipeComments");
    })
    .catch(() => {
      toast.error("Unable to update comment, try again later.");
    });
};

const deleteComment = async (id: string) => {
  optimisticRemoved.value = [...optimisticRemoved.value, id];

  Comments.using(client)
    .deleteComment(id)
    .finally(() => {
      refreshNuxtData("recipeComments");
    })
    .catch(() => {
      toast.error("Unable to delete comment, try again later.");
    });
};
</script>

<template>
  <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
    <div class="flex min-w-56 basis-56 flex-col gap-4">
      <h3 class="heading-3">Ingredients</h3>
      <ul
        class="sticky top-0 grid grid-cols-[1fr_auto_auto_auto] gap-x-1 gap-y-2"
      >
        <li
          v-for="ingredient in recipe.ingredients"
          :key="ingredient.id"
          class="col-span-4 grid grid-cols-subgrid pb-1"
          :class="'separate' in ingredient ? '' : 'border-b'"
        >
          <template v-if="'separate' in ingredient">
            <div class="mb-1 mt-6 text-xs uppercase text-muted-foreground">
              {{ ingredient.separate }}
            </div>
          </template>
          <template v-else>
            <div class="">
              {{ ingredient.name }}
            </div>
            <div />
            <div class="justify-self-end">
              {{
                ingredient.quantity &&
                formatter.formatQuantity(ingredient.quantity, ingredient.unit)
              }}
            </div>
            <span class="text-gray-400">
              {{ ingredient.unit && formatter.formatUnit(ingredient.unit) }}
            </span>
            <div
              v-if="ingredient.notes"
              class="col-span-3 text-xs text-muted-foreground"
            >
              {{ ingredient.notes }}
            </div>
          </template>
        </li>
      </ul>
    </div>

    <div
      class="flex grow flex-col gap-6 rounded-t-xl border p-5 shadow-md backdrop-blur-3xl"
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
          class="ml-6 flex list-decimal flex-col gap-2 marker:text-muted-foreground"
        >
          <RecipeStep
            v-for="(step, index) in recipe.steps"
            :key="index"
            :step="step"
            :comment-to="commentContainer"
            :comments="commentsForStep(step.id)"
            @add-comment="addCommentToStep(step.id)"
            @update-comment="updateComment"
            @delete-comment="deleteComment"
          />
        </ol>
      </div>
    </div>
    <div ref="commentContainer" class="relative min-w-56 basis-56"></div>
  </div>
</template>
