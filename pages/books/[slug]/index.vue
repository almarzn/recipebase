<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { Plus, CookingPot, ChevronDown } from "lucide-vue-next";
import { useCurrentBook } from "~/composables/useCurrentBook";
import { Recipes } from "~/lib/recipes";

const book = await useCurrentBook();

const client = useSupabaseClient<Database>();

const { data: recipes } = await useAsyncData(
  () => Recipes.using(client).getRecipesByBookId(book.value?.id),
  { watch: [book] },
);
</script>

<template>
  <div
    class="max-w-screen-xl flex flex-col gap-8 items-stretch w-full self-center p-4"
  >
    <h3 class="heading-2">{{ book?.name }}</h3>
    <div class="flex justify-between flex-wrap">
      <h3 class="heading-3">Recipes</h3>
      <div class="flex flex-wrap gap-3 items-stretch">
        <NuxtLink
          :to="{ name: 'books-slug-create', params: { slug: book?.slug } }"
        >
          <Button>
            <Plus />
            Create recipe
          </Button>
        </NuxtLink>
        <Button variant="outline">
          Import recipe
          <ChevronDown />
        </Button>
      </div>
    </div>

    <div
      v-if="recipes?.length === 0"
      class="flex gap-8 items-center self-center"
    >
      <CookingPot :size="64" class="stroke-muted-foreground" />
      <div class="flex flex-col gap-3 max-w-96 items-start self-center">
        <h4 class="heading-4">No recipe created yet</h4>
        <p class="text-muted-foreground">
          Create a new recipe to add it to this book.
        </p>
        <Button>
          <Plus />
          Create recipe
        </Button>
      </div>
    </div>

    <div v-else class="flex flex-col gap-8 items-stretch self-stretch">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="border p-6 rounded-md backdrop-blur-xl"
      >
        <div>{{ recipe.name }}</div>
      </div>
    </div>
  </div>
</template>
