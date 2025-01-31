<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { PencilLine, Plus, ScanText } from "lucide-vue-next";
import { Recipes } from "~/lib/Recipes";
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

import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from "@/components/ui/pagination";
import { useSearchResults } from "~/pages/recipes/useSearchResults";
import { Tags } from "~/lib/Tags";

const rowsPerPage = 10;

const searchResults = await useSearchResults(rowsPerPage);
const client = useSupabaseClient<Database>();

const tags = await useAsyncData(
  async () => {
    return Tags.using(client).findAll();
  },
  {
    lazy: true,
  },
);

watch([searchResults.tags, searchResults.text], () => {
  searchResults.currentPage.value = 1;
});

watch(searchResults.recipes, () => {
  window.document.scrollingElement?.scrollTo({
    behavior: "smooth",
    top: 0,
  });
});
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
      <RecipeFilters
        v-model:text="searchResults.text.value"
        v-model:tags="searchResults.tags.value"
      />

      <div class="flex grow flex-col items-stretch justify-stretch">
        <ErrorStatus v-if="searchResults.status.value === 'error'" />

        <RecipeListPage
          v-else-if="searchResults.recipes.value?.data"
          :recipes="searchResults.recipes.value.data"
          :loading="searchResults.status.value === 'pending'"
          :all-tags="tags.data.value"
        />

        <RecipeListSkeleton v-else-if="!searchResults.recipes.value?.data" />

        <div class="h-8"></div>

        <Pagination
          v-if="searchResults.recipes.value?.data"
          v-slot="{ page }"
          v-model:page="searchResults.currentPage.value"
          :total="searchResults.recipes.value.count ?? 0"
          :sibling-count="1"
          :items-per-page="rowsPerPage"
          show-edges
        >
          <PaginationList v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrev />

            <template v-for="(item, index) in items">
              <PaginationListItem
                v-if="item.type === 'page'"
                :key="index"
                :value="item.value"
                as-child
              >
                <Button
                  class="size-9 p-0"
                  :variant="item.value === page ? 'default' : 'outline'"
                >
                  {{ item.value }}
                </Button>
              </PaginationListItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext />
            <PaginationLast />
          </PaginationList>
        </Pagination>
      </div>
    </div>
  </PageLayout>
</template>
