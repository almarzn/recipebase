<script setup lang="ts">
import type { RecipeDetails } from "~/types/recipe";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import { UnitFormatter } from "~/lib/Unit";

defineProps<{
  recipe: RecipeDetails;
}>();

const formatter = new UnitFormatter({
  style: "short",
});
</script>

<template>
  <div class="flex grow gap-4 max-md:flex-col md:gap-10 lg:gap-20">
    <div class="flex min-w-56 basis-56 flex-col gap-4">
      <h3 class="heading-3">Ingredients</h3>
      <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-x-1 gap-y-2">
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

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1">
            <RecipeTag v-for="tag in recipe.tags" :key="tag.id" :tag />
          </div>
          <h2 class="heading-2">{{ recipe.name }}</h2>
        </div>
        <p class="text-muted-foreground">{{ recipe.description }}</p>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="heading-3">Steps</h3>

        <ol
          class="ml-6 flex list-decimal flex-col gap-2 marker:text-muted-foreground"
        >
          <li v-for="(step, index) in recipe.steps" :key="index">
            {{ step.text }}
            <div
              v-if="step.notes"
              class="col-span-3 text-xs text-muted-foreground"
            >
              {{ step.notes }}
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
