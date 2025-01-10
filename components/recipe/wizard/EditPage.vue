<script setup lang="ts">
import { useSupabaseClient } from "#imports";
import type { Database } from "~/types/database.types";
import { useMemoize } from "@vueuse/core";
import { Recipes } from "~/lib/Recipes";
import {
  type ExistingRecipe,
  type RecipePayload,
  recipePayload,
} from "~/types/recipe";
import { Check, Cog, CookingPot, ShoppingBasket } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import {
  GeneralForm,
  IngredientsForm,
  StepsForm,
} from "~/components/recipe/wizard/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Form } from "vee-validate";
import { slugify } from "~/lib/utils";

const { recipe } = defineProps<{ recipe: ExistingRecipe }>();

const client = useSupabaseClient<Database>();

const getSlugId = useMemoize(async (name: string) => {
  return (await Recipes.using(client).getBySlug(slugify(name)))?.id;
});

const pages = computed(() => {
  const id = recipe.id;

  return [
    {
      key: "general",
      title: "General",
      schema: recipePayload
        .pick({
          description: true,
          name: true,
          tags: true,
        })
        .refine(
          async (props) => {
            const existingId = await getSlugId(props.name);

            return !existingId || existingId === id;
          },
          {
            path: ["name"],
            message: "That name is already taken",
          },
        ),
      icon: Cog,
    },
    {
      key: "ingredients",
      title: "Ingredients",
      schema: recipePayload.pick({
        ingredients: true,
      }),
      icon: ShoppingBasket,
    },
    {
      key: "steps",
      title: "Steps",
      schema: recipePayload.pick({
        steps: true,
      }),
      icon: CookingPot,
    },
  ];
});

const submitting = ref(false);

const submit = async (
  values: Partial<RecipePayload>,
  resetForm: (values: Partial<object>) => unknown,
) => {
  submitting.value = true;

  try {
    await Recipes.using(client).updateById(recipe.id, values);

    resetForm({ values: { ...recipe, ...values } });

    toast.success("Successfully updated recipe");
  } catch {
    toast.error("An error occurred while updating the recipe");
  } finally {
    submitting.value = false;
  }
};
</script>
<template>
  <Tabs
    default-value="general"
    class="flex items-start gap-7 max-md:flex-col max-md:items-stretch"
  >
    <TabsList class="grid grid-cols-1 md:basis-52">
      <TabsTrigger
        v-for="page in pages"
        :key="page.key"
        :value="page.key"
        class="px-4 py-2"
      >
        {{ page.title }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="page in pages"
      :key="page.key"
      :value="page.key"
      class="grow"
    >
      <Form
        v-slot="{ meta, values, resetForm }"
        as=""
        keep-values
        :validation-schema="toTypedSchema(page.schema)"
        :initial-values="recipe"
        validate-on-mount
      >
        <form
          class="flex flex-col gap-6 grow items-stretch"
          @submit="
            (e) => {
              e.preventDefault();

              if (meta.valid) {
                submit(values as RecipePayload, resetForm);
              }
            }
          "
        >
          <GeneralForm v-if="page.key === 'general'" />
          <IngredientsForm v-if="page.key === 'ingredients'" />
          <StepsForm v-if="page.key === 'steps'" />

          <div class="flex gap-2">
            <Button
              type="submit"
              :loading="submitting"
              :disabled="!meta.dirty"
              @click="
                meta.valid &&
                submit(values as Partial<RecipePayload>, resetForm)
              "
            >
              Save changes
              <Check />
            </Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  </Tabs>
</template>
