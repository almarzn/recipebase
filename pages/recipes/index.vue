<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { BadgePlus, Globe, Image, Plus } from "lucide-vue-next";
import { type RecipeQuery, Recipes } from "~/lib/Recipes";
import PageLayout from "~/components/layout/PageLayout.vue";
import { AdaptiveBreadcrumbs } from "~/components/layout";
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

const importing = ref<"url" | "image">();
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
        <ImportUrlModal
          :model-value="importing === 'url'"
          @update:model-value="importing = undefined"
          @create="refreshNuxtData('recipes')"
        />
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
                <BadgePlus />
                <div class="flex flex-col">
                  <div class="flex items-center">Create manually</div>
                  <div class="text-xs text-muted-foreground">
                    Add a recipe by following our wizard. You will be able to
                    specify ingredients and steps.
                  </div>
                </div>
              </DropdownMenuItem>
            </NuxtLink>
            <DropdownMenuItem @click="importing = 'url'">
              <Globe />
              <div class="flex flex-col">
                <div class="flex items-center">Import from webpage</div>
                <div class="text-xs text-muted-foreground">
                  Paste any link pointing to a recipe and add it to your
                  recipes. You will then be able to edit it.
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem @click="importing = 'image'">
              <Image />
              <div class="flex flex-col">
                <div class="flex items-center">Import from image</div>
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
      <RecipeFilters v-model="query" />

      <div class="flex grow flex-col items-stretch justify-stretch">
        <RecipeListPage v-if="status === 'success'" :recipes />
        <RecipeListSkeleton v-if="status === 'pending'" />
        <ErrorStatus v-if="status === 'error'" />
      </div>
    </div>
  </PageLayout>
</template>
