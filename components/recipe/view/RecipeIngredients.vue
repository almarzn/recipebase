<template>
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
</template>
<script setup lang="ts">
import { UnitFormatter } from "~/lib/Unit";
import type { RecipeDetails } from "~/types/recipe";

defineProps<{
  recipe: Pick<RecipeDetails, "ingredients">;
}>();

const formatter = new UnitFormatter({
  style: "short",
});
</script>
