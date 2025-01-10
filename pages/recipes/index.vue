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

const client = useSupabaseClient<Database>();

const { data: recipes, error } = await useAsyncData("recipes", () =>
  Recipes.using(client).findAllWithTags(),
);

const importing = ref<"url" | "image">();
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
            text: 'Recipes',
          },
        ]"
      />
      <div class="flex flex-wrap gap-3 items-stretch">
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
                <div class="text-muted-foreground text-xs">
                  Paste any link pointing to a recipe and add it to your
                  recipes. You will then be able to edit it.
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem @click="importing = 'image'">
              <Image />
              <div class="flex flex-col">
                <div class="flex items-center">From image</div>
                <div class="text-muted-foreground text-xs">
                  Upload a picture from a book and use it to get started!
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            Create a new recipe to view it here.
          </p>
        </div>
        <Button>
          <Plus />
          Create recipe
        </Button>
      </div>
    </div>

    <error-status v-if="error" />

    <div
      v-else
      class="flex flex-col gap-2 items-stretch self-stretch backdrop-blur-3xl"
    >
      <NuxtLink
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="{
          name: 'recipes-slug',
          params: { slug: recipe.slug },
        }"
        class="border p-6 rounded-md flex flex-col gap-2"
      >
        <div class="flex flex-col">
          <div class="font-medium">{{ recipe.name }}</div>
          <div class="text-xs text-muted-foreground">
            {{ recipe.description }}
          </div>
        </div>
        <div v-if="recipe.tags.length > 0" class="flex gap-2">
          <RecipeTag v-for="tag in recipe.tags" :key="tag.id" :tag />
        </div>
      </NuxtLink>
    </div>
  </PageLayout>
</template>
