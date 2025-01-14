<script setup lang="ts">
import { Field, FieldArray } from "vee-validate";
import { IngredientInput } from "@/components/ui/ingredient-input";
import type { Ingredient } from "~/types/recipe";
import { PlusCircle, Redo2, Trash2 } from "lucide-vue-next";
import { Label } from "~/components/ui/label";
import { getUnitByShort } from "~/lib/Unit";
import { Input } from "~/components/ui/input";
import { FormControl, FormItem } from "~/components/ui/form";
import { v4 } from "uuid";

const naturalIngredientRegex =
  /^\s*(?<quantity>\d+)(?<unit>\w+)?\s+(?:de |d'|of )?(?<name>.+)$/;

const addingIngredientText = ref("");

const addingIngredient = computed((): Omit<Ingredient, "id"> | undefined => {
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

const newIngredient = (props: Partial<Ingredient> = {}) => {
  return { unit: "arbitrary", id: v4(), ...props };
};
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
          <Button variant="outline" @click.prevent="push(newIngredient())">
            <PlusCircle />
            Add an ingredient
          </Button>
        </div>
      </div>
      <ul
        v-else
        class="grid min-h-64 grid-cols-[auto_auto_1fr_2fr_auto] content-start gap-2 px-4 pt-4"
      >
        <li
          class="col-span-5 grid grid-cols-subgrid text-xs text-muted-foreground"
        >
          <div>Quantity</div>
          <div>Units</div>
          <div>Name</div>
          <div>Notes</div>
          <div></div>
        </li>
        <template
          v-for="(element, index) in fields"
          :key="(element.value! as Ingredient).id"
        >
          <Field
            v-if="'separate' in (element.value as any)"
            v-slot="{ componentField }"
            :name="`ingredients[${index}].separate`"
          >
            <FormItem
              class="col-span-5 grid grid-cols-subgrid items-center space-y-0"
            >
              <div class="col-span-2 text-xs text-muted-foreground">
                Separator
              </div>

              <div class="group col-span-2">
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Separator label"
                  />
                </FormControl>
                <FormMessage />
              </div>
              <Button
                variant="ghost"
                class="aspect-square p-2"
                @click="remove(index)"
              >
                <Trash2 />
              </Button>
            </FormItem>
          </Field>
          <IngredientInput
            v-else
            as="li"
            class=""
            :name="`ingredients[${index}]`"
            @delete="remove(index)"
          />
        </template>
        <li class="col-span-5 grid grid-cols-subgrid">
          <div class="col-span-4 flex gap-2">
            <Button
              class="grow"
              variant="outline"
              type="button"
              @click.prevent="push(newIngredient())"
            >
              <PlusCircle />
              Add another ingredient
            </Button>
            <Button
              class="grow"
              variant="outline"
              type="button"
              @click.prevent="
                push({
                  id: v4(),
                  separate: '',
                })
              "
            >
              Add a separator
            </Button>
            <div></div>
          </div>
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
              push(newIngredient(addingIngredient));
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
