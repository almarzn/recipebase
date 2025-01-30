<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { PencilLine, Plus, ScanText } from "lucide-vue-next";
import { type RecipeQuery, Recipes } from "~/lib/Recipes";
import PageLayout from "~/components/layout/PageLayout.vue";
import { AdaptiveBreadcrumbs } from "~/components/layout";
import { ErrorStatus } from "~/components/ui/status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RecipeListPage from "~/components/recipe/list/RecipeListPage.vue";
import RecipeListSkeleton from "~/components/recipe/list/RecipeListSkeleton.vue";
import RecipeFilters from "~/components/recipe/list/RecipeFilters.vue";
import { useDebounceFn } from "@vueuse/core";

const client = useSupabaseClient<Database>();

const query = reactive<RecipeQuery>({
  tags: [],
  text: "",
});

const { data: recipes, status } = await useAsyncData(
  "recipes",
  useDebounceFn(() => {
    return Recipes.using(client).findAllWithTags(query);
  }, 500),
  {
    lazy: true,
    watch: [query],
  },
);
</script>

<template>
  <PageLayout>
    <div class="flex items-center justify-between gap-4">
      <AdaptiveBreadcrumbs
        :items="[
          {
            to: { name: 'index' },
            text: 'Home',
          },
          {
            text: 'Recipes',
          },
        ]"
      />
      <div class="flex flex-wrap items-stretch gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>
              <Plus />
              Create
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="max-w-sm">
            <NuxtLink
              :to="{
                name: 'create-recipe',
              }"
            >
              <DropdownMenuItem>
                <PencilLine />
                <div class="flex flex-col">
                  <div class="flex items-center">Create manually</div>
                  <div class="text-xs text-muted-foreground">
                    Add a recipe by following our wizard. You will be able to
                    specify ingredients and steps.
                  </div>
                </div>
              </DropdownMenuItem>
            </NuxtLink>
            <NuxtLink
              :to="{
                name: 'import',
              }"
            >
              <DropdownMenuItem>
                <ScanText />
                <div class="flex flex-col">
                  <div class="flex items-center">
                    Import from an image, a text or a webpage
                  </div>
                  <div class="text-xs text-muted-foreground">
                    Add your recipes directly from an external source right
                    here. We use a LLM to scan the page and import these.
                  </div>
                </div>
              </DropdownMenuItem>
            </NuxtLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
      <RecipeFilters v-model="query" />

      <div class="flex grow flex-col items-stretch justify-stretch">
        <RecipeListPage v-if="status === 'success'" :recipes />
        <RecipeListSkeleton v-if="status === 'pending'" />
        <ErrorStatus v-if="status === 'error'" />
      </div>
    </div>
  </PageLayout>
</template>
