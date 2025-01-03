<script setup lang="ts">
import { FieldArray } from "vee-validate";
import { Label } from "radix-vue";
import { IngredientInput } from "@/components/ui/ingredient-input";
import type { Ingredient, RealUnit } from "~/types/recipe";
import { Redo2 } from "lucide-vue-next";

const naturalIngredientRegex =
  /^\s*(?<quantity>\d+)(?<unit>\w+)?\s+(?:de |d'|of )?(?<name>.+)$/;

const addingIngredientText = ref("");

const unitConverter: Record<string, RealUnit> = {
  G: "GRAM",
  KG: "KILOGRAM",
  ML: "MILLITER",
  L: "LITER",
};

const addingIngredient = computed((): Ingredient | undefined => {
  const match = naturalIngredientRegex.exec(addingIngredientText.value);
  if (!match || !match.groups) {
    return undefined;
  }
  const { quantity, unit = "", name } = match.groups;

  return {
    quantity: Number(quantity),
    unit: unitConverter[unit.toUpperCase()] ?? "ARBITRARY",
    name,
  };
});
</script>
<template>
  <FieldArray v-slot="{ fields, push, remove }" name="ingredients">
    <Label>Ingredients</Label>
    <div
      class="flex flex-col gap-2 border bg-card/10 backdrop-blur text-card-foreground rounded-md"
    >
      <div
        v-if="fields.length === 0"
        class="grow items-center flex flex-col gap-2 justify-center min-h-64"
      >
        <div
          class="text-muted-foreground text-md font-semibold max-w-44 text-center"
        >
          No ingredient yet
        </div>
        <div class="text-muted-foreground text-xs max-w-44 text-center">
          Write a new ingredient in the input and press enter
        </div>
      </div>
      <ul v-else class="flex flex-col gap-1 min-h-64 pt-4 px-4">
        <li v-for="(_, index) in fields" :key="index">
          <IngredientInput
            :name="`ingredients[${index}]`"
            @delete="remove(index)"
          />
        </li>
      </ul>
      <div class="flex flex-col gap-1 border-t p-2">
        <label
          class="text-xs text-muted-foreground/50 pl-3 font-lights"
          for="add-ingredient"
        >
          Add an ingredient
        </label>
        <div class="flex gap-1">
          <Input
            id="add-ingredient"
            v-model="addingIngredientText"
            class="border-none"
            name="add_ingredient"
            placeholder="e.g: 12g of butter"
            @keydown.enter.prevent="
              push(addingIngredient);
              addingIngredientText = '';
            "
          />
          <Button
            variant="secondary"
            :disabled="addingIngredient === undefined"
            @click="
              push(addingIngredient);
              addingIngredientText = '';
            "
          >
            <Redo2 class="rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  </FieldArray>
</template>
