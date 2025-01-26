<template>
  <div class="flex h-full min-w-56 basis-56 flex-col gap-6">
    <h3 class="heading-3 max-lg:hidden">Ingredients</h3>
    <RecipeServingsFragment
      v-if="recipe.servings !== null"
      v-model="quantityMultiplier"
      :servings="recipe.servings"
    />
    <div class="sticky top-4 flex flex-col gap-6">
      <CollapsibleRoot
        v-for="group in groupedBySeparators"
        :key="group.id"
        class="group/collapsible flex flex-col gap-3"
        default-open
      >
        <CollapsibleTrigger
          v-if="group.label"
          class="flex items-center justify-between"
        >
          <div class="text-start text-xs uppercase text-muted-foreground">
            {{ group.label }}
          </div>
          <ChevronsUpDown
            class="size-3.5 stroke-muted-foreground opacity-0 transition-opacity group-hover/collapsible:opacity-100"
          />
        </CollapsibleTrigger>
        <CollapsibleContent
          class="grid grid-cols-[1fr_auto_auto_auto] gap-x-1 gap-y-2"
        >
          <li
            v-for="ingredient in group.ingredients"
            :key="ingredient.id"
            class="col-span-4 grid grid-cols-subgrid pb-1"
            :class="'separate' in ingredient ? '' : 'border-b'"
          >
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
          </li>
        </CollapsibleContent>
      </CollapsibleRoot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ScalingFormatter, UnitFormatter } from "~/lib/Unit";
import type { Ingredient, RecipeDetailsSaved } from "~/types/recipe";
import { v4 } from "uuid";
import { initial, last } from "lodash";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "radix-vue";
import { ChevronsUpDown } from "lucide-vue-next";
import RecipeServingsFragment from "~/components/recipe/view/RecipeServingsFragment.vue";

const quantityMultiplier = defineModel<number>({
  default: 1,
});

const props = defineProps<{
  recipe: Pick<RecipeDetailsSaved, "ingredients" | "servings" | "saved" | "id">;
}>();

const formatter = computed(
  () =>
    new ScalingFormatter(
      new UnitFormatter({
        style: "short",
      }),
      quantityMultiplier.value / (props.recipe.servings?.amount ?? 1),
    ),
);

const groupedBySeparators = computed(() =>
  props.recipe.ingredients.reduce(
    (acc, val) => {
      if ("separate" in val) {
        return [
          ...acc,
          {
            id: val.id,
            label: val.separate,
            ingredients: [],
          },
        ];
      }

      if (acc.length === 0) {
        return [
          {
            id: v4(),
            ingredients: [val],
          },
        ];
      }
      const lastElement = last(acc)!;

      return [
        ...initial(acc),
        {
          ...lastElement,
          ingredients: [...lastElement.ingredients, val],
        },
      ];
    },
    [] as { id: string; label?: string; ingredients: Ingredient[] }[],
  ),
);
</script>
