<script setup lang="ts">
import { FieldArray } from "vee-validate";
import { IngredientInput } from "@/components/ui/ingredient-input";
import {
  type Ingredient,
  ingredientSchema,
  type IngredientUnit,
  ingredientUnitSchema,
} from "~/types/recipe";
import { Redo2, PlusCircle } from "lucide-vue-next";
import { Label } from "~/components/ui/label";
import { getUnitByShort, UnitFormatter } from "~/lib/Unit";

const naturalIngredientRegex =
  /^\s*(?<quantity>\d+)(?<unit>\w+)?\s+(?:de |d'|of )?(?<name>.+)$/;

const addingIngredientText = ref("");

const addingIngredient = computed((): Ingredient | undefined => {
  const match = naturalIngredientRegex.exec(addingIngredientText.value);
  if (!match || !match.groups) {
    return undefined;
  }
  const { quantity, unit = "", name } = match.groups;

  return {
    quantity: Number(quantity),
    unit: getUnitByShort(unit),
    name,
  };
});
</script>
<template>
  <FieldArray v-slot="{ fields, push, remove }" name="ingredients">
    <Label>Ingredients</Label>
    <div
      class="flex flex-col gap-2 rounded-md border bg-card/10 text-card-foreground backdrop-blur"
    >
      <div
        v-if="fields.length === 0"
        class="flex min-h-64 grow flex-col items-center justify-center gap-2"
      >
        <div
          class="max-w-44 text-center text-base font-semibold text-muted-foreground"
        >
          No ingredient yet
        </div>
        <div class="max-w-44 text-center text-xs text-muted-foreground">
          Write a new ingredient in the input and press enter, or:
        </div>
        <div class="h-1"></div>
        <div class="max-w-44 text-center text-xs text-muted-foreground">
          <Button
            variant="outline"
            @click.prevent="push({ unit: 'arbitrary' })"
          >
            <PlusCircle />
            Add an ingredient
          </Button>
        </div>
      </div>
      <ul
        v-else
        class="grid min-h-64 grid-cols-[auto_auto_1fr_auto] content-start gap-2 px-4 pt-4"
      >
        <li
          class="col-span-4 grid grid-cols-subgrid text-xs text-muted-foreground"
        >
          <div>Quantity</div>
          <div>Units</div>
          <div>Name</div>
          <div></div>
        </li>
        <IngredientInput
          v-for="(_, index) in fields"
          :key="index"
          as="div"
          class=""
          :name="`ingredients[${index}]`"
          @delete="remove(index)"
        />
        <li class="col-span-4 grid grid-cols-subgrid">
          <Button
            class="col-span-3 w-full"
            variant="outline"
            type="button"
            @click.prevent="
              push({
                unit: 'arbitrary',
              })
            "
          >
            <PlusCircle />
            Add another ingredient
          </Button>
          <div></div>
        </li>
      </ul>
      <div class="flex flex-col gap-1 border-t p-2">
        <label
          class="pl-3 text-xs text-muted-foreground/50"
          for="add-ingredient"
        >
          Or type to add an ingredient using (quantity + unit + name)
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
