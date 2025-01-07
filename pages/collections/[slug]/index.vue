<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { Plus, CookingPot, ChevronDown } from "lucide-vue-next";
import { useCurrentCollection } from "~/composables/useCurrentCollection";
import { Recipes } from "~/lib/Recipes";
import PageLayout from "~/components/layout/PageLayout.vue";
import { Breadcrumbs } from "~/components/layout";
import { toast } from "vue-sonner";
import { ErrorStatus } from "~/components/ui/status";

const collection = await useCurrentCollection();

const client = useSupabaseClient<Database>();

const { data: recipes, error } = await useAsyncData(
  () => Recipes.using(client).findAllByCollectionId(collection.value!.id),
  { watch: [collection] },
);
</script>

<template>
  <PageLayout>
    <div class="flex justify-between flex-wrap items-center">
      <breadcrumbs
        :items="[
          {
            to: { name: 'index' },
            text: 'Home',
          },
          {
            to: { name: 'collections' },
            text: 'Collections',
          },
          {
            // to: { name: 'books-slug', params: { slug: book?.slug } },
            text: collection?.name,
          },
        ]"
      />
      <div class="flex flex-wrap gap-3 items-stretch">
        <NuxtLink
          :to="{
            name: 'collections-slug-create',
            params: { slug: collection!.slug },
          }"
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
      <div class="flex flex-col gap-4 max-w-96 items-start self-center">
        <div class="flex flex-col gap-1">
          <h4 class="heading-4">No recipe created yet</h4>
          <p class="text-muted-foreground">
            Create a new recipe to add it to this collection.
          </p>
        </div>
        <Button>
          <Plus />
          Create recipe
        </Button>
      </div>
    </div>

    <error-status v-if="error" />

    <div v-else class="flex flex-col gap-8 items-stretch self-stretch">
      <NuxtLink
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="{
          name: 'collections-slug-recipes-recipeSlug',
          params: { slug: collection!.slug, recipeSlug: recipe.slug },
        }"
        class="border p-6 rounded-md backdrop-blur-xl"
      >
        <div>{{ recipe.name }}</div>
      </NuxtLink>
    </div>
  </PageLayout>
</template>
