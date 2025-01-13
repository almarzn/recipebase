<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { type RecipePayload, recipePayload } from "~/types/recipe";
import { Form } from "vee-validate";
import {
  GeneralForm,
  IngredientsForm,
  StepsForm,
} from "~/components/recipe/wizard";
import {
  ArrowRight,
  Cog,
  CookingPot,
  ShoppingBasket,
  Check,
} from "lucide-vue-next";
import type { Database } from "~/types/database.types";
import { useCurrentCollection } from "~/composables/useCurrentCollection";
import { Recipes } from "~/lib/Recipes";
import { slugify } from "~/lib/utils";
import FormStepper from "~/components/ui/form-stepper/FormStepper.vue";
import { toast } from "vue-sonner";

const client = useSupabaseClient<Database>();

const book = await useCurrentCollection();

const { data: recipes, status } = await useAsyncData(
  () => Recipes.using(client).getRecipeSlugs(),
  { lazy: true },
);

const steps = computed(() => {
  const recipeSlugs = recipes.value;

  return [
    {
      step: 1,
      title: "General",
      description: "Provide the recipe name and the general details",
      schema: recipePayload
        .pick({
          description: true,
          name: true,
          tags: true,
        })
        .refine(
          ({ name }) => {
            if (status.value === "pending") {
              return false;
            }
            return !recipeSlugs?.includes(slugify(name));
          },
          { path: ["name"], message: "That name is already taken" },
        ),
      icon: Cog,
    },
    {
      step: 2,
      title: "Ingredients",
      description: "List here the ingredients in your recipe",
      schema: recipePayload.pick({
        ingredients: true,
      }),
      icon: ShoppingBasket,
    },
    {
      step: 3,
      title: "Steps",
      description: "Write the different preparation steps for the recipe",
      schema: recipePayload.pick({
        steps: true,
      }),
      icon: CookingPot,
    },
  ];
});

const currentStep = ref(1);

const submitting = ref(false);

const submit = async (values: RecipePayload) => {
  submitting.value = true;

  try {
    const { slug } = await $fetch(`/api/books/${book.value?.id}/recipes`, {
      method: "post",
      body: values,
    });

    navigateTo(`/books/${book.value?.slug}/recipes/${slug}`);
  } catch {
    toast.error("An error occured while creating the recipe");
    submitting.value = false;
  }
};
</script>

<template>
  <Form
    v-slot="{ meta, values, validate }"
    as=""
    keep-values
    :validation-schema="toTypedSchema(steps[currentStep - 1].schema)"
    :initial-values="{
      ingredients: [],
      tags: [],
    }"
  >
    <FormStepper
      v-slot="{
        isNextDisabled,
        isPrevDisabled,
        nextStep,
        prevStep,
        isLastStep,
      }"
      v-model="currentStep"
      orientation="vertical"
      :steps
      header="Create a new recipe"
      sub-header="Create a new recipe, for dessert or salé, whatever you want."
      :back-link-to="{ name: 'books-slug', params: { slug: book?.slug } }"
    >
      <form
        class="flex grow flex-col items-stretch gap-6"
        @submit="
          (e) => {
            e.preventDefault();
            validate();

            if (isLastStep && meta.valid) {
              submit(values as RecipePayload);
            }
          }
        "
      >
        <GeneralForm v-if="currentStep === 1" />
        <IngredientsForm v-if="currentStep === 2" />
        <StepsForm v-if="currentStep === 3" />

        <div class="flex gap-2">
          <Button
            variant="outline"
            type="button"
            :disabled="isPrevDisabled"
            @click="prevStep()"
          >
            Previous
          </Button>
          <Button
            v-if="isLastStep"
            type="submit"
            :loading="submitting"
            @click="
              validate();
              meta.valid && nextStep();
            "
          >
            Create recipe
            <Check />
          </Button>
          <Button
            v-else
            :disabled="isNextDisabled"
            type="button"
            @click="
              validate();
              meta.valid && nextStep();
            "
          >
            Next
            <ArrowRight />
          </Button>
        </div>
      </form>
    </FormStepper>
  </Form>
</template>
