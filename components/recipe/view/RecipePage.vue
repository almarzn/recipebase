<script setup lang="ts">
import type { IngredientUnit, Recipe } from "~/types/recipe";
import { ShoppingBasket, CookingPot } from "lucide-vue-next";

defineProps<{
  recipe: Recipe;
}>();

const units: Record<IngredientUnit, string> = {
  GRAM: "g",
  KILOGRAM: "kg",
  MILLITER: "ml",
  LITER: "l",
  ARBITRARY: " ",
};
</script>

<template>
  <div class="flex grow gap-20 max-md:flex-col">
    <div class="flex flex-col gap-4 min-w-56">
      <h3 class="heading-3">Ingredients</h3>
      <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-x-1 gap-y-2">
        <li
          v-for="(ingredient, index) in recipe.ingredients"
          :key="index"
          class="grid grid-cols-subgrid col-span-4 border-b pb-1"
        >
          <div class="">
            {{ ingredient.name }}
          </div>
          <div />
          <div class="place-self-end">
            {{ ingredient.quantity }}
          </div>
          <span class="text-gray-400">
            {{ units[ingredient.unit] }}
          </span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <p class="text-muted-foreground">{{ recipe.description }}</p>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="heading-3">Steps</h3>

        <ol
          class="list-decimal flex flex-col gap-2 marker:text-muted-foreground ml-6"
        >
          <li v-for="(step, index) in recipe.steps" :key="index">
            {{ step.text }}
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
