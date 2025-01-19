<script setup lang="ts">
import type { Database } from "~/types/database.types";
import { ChevronDown, CookingPot, Globe, Image, Plus } from "lucide-vue-next";
import { Recipes } from "~/lib/Recipes";
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
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import RecipeListPage from "~/components/recipe/list/RecipeListPage.vue";
import RecipeListSkeleton from "~/components/recipe/list/RecipeListSkeleton.vue";

const client = useSupabaseClient<Database>();

const { data: recipes, status } = await useAsyncData(
  "recipes",
  () => Recipes.using(client).findAllWithTags(),
  { lazy: true, server: true },
);
const importing = ref<"url" | "image">();
</script>

<template>
  <PageLayout>
    <div class="flex flex-wrap items-center justify-between">
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
    <RecipeListPage v-if="status === 'success'" :recipes />
    <RecipeListSkeleton v-if="status === 'pending'" />
    <ErrorStatus v-if="status === 'error'" />
  </PageLayout>
</template>
