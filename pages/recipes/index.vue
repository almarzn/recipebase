<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { ChevronDown, Globe, Image, Plus } from "lucide-vue-next";
import { type RecipeQuery, Recipes } from "~/lib/Recipes";
import PageLayout from "~/components/layout/PageLayout.vue";
import { Breadcrumbs } from "~/components/layout";
import { ErrorStatus } from "~/components/ui/status";
import ImportUrlModal from "~/components/recipe/ImportUrlModal.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RecipeListPage from "~/components/recipe/list/RecipeListPage.vue";
import RecipeListSkeleton from "~/components/recipe/list/RecipeListSkeleton.vue";
import RecipeFilters from "~/components/recipe/list/RecipeFilterPage.vue";

const client = useSupabaseClient<Database>();

const query = ref<RecipeQuery>({
  withTags: [],
});

const { data: recipes, status } = await useAsyncData(
  "recipes",
  () => {
    return Recipes.using(client).findAllWithTags(query.value);
  },
  {
    lazy: true,
    watch: [query],
  },
);

const importing = ref<"url" | "image">();
</script>

<template>
  <PageLayout>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <breadcrumbs
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
        <NuxtLink
          :to="{
            name: 'create-recipe',
          }"
        >
          <Button>
            <Plus />
            Create recipe
          </Button>
        </NuxtLink>
        <ImportUrlModal
          :model-value="importing === 'url'"
          @update:model-value="importing = undefined"
          @create="refreshNuxtData('recipes')"
        />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">
              Import recipe
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="max-w-64">
            <DropdownMenuItem @click="importing = 'url'">
              <Globe />
              <div class="flex flex-col">
                <div class="flex items-center">From webpage</div>
                <div class="text-xs text-muted-foreground">
                  Paste any link pointing to a recipe and add it to your
                  recipes. You will then be able to edit it.
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem @click="importing = 'image'">
              <Image />
              <div class="flex flex-col">
                <div class="flex items-center">From image</div>
                <div class="text-xs text-muted-foreground">
                  Upload a picture from a book and use it to get started!
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
      <div class="flex min-w-64 flex-col">
        <RecipeFilters v-model="query" />
      </div>

      <div class="flex grow flex-col items-stretch justify-stretch">
        <RecipeListPage v-if="status === 'success'" :recipes />
        <RecipeListSkeleton v-if="status === 'pending'" />
        <ErrorStatus v-if="status === 'error'" />
      </div>
    </div>
  </PageLayout>
</template>
