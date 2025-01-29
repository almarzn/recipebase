<template>
  <div
    class="w-full self-center overflow-hidden border border-b-0 max-md:border-x-0 md:rounded-t-xl"
  >
    <TabsRoot v-model="selectedTab">
      <TabsList
        class="grid grid-cols-responsive-tabs gap-px bg-border grid-areas-responsive-tabs max-md:grid-cols-1 data-[selected=recipe]:max-md:grid-areas-responsive-tabs-slim-1 data-[selected=import]:max-md:grid-areas-responsive-tabs-slim-2 data-[selected=organize]:max-md:grid-areas-responsive-tabs-slim-3"
        :data-selected="selectedTab"
      >
        <TabsTrigger
          value="recipe"
          class="product-tab flex flex-col justify-center gap-1 p-5 text-start grid-in-tab1"
        >
          <h3 class="text-base">Focus on your skills</h3>
          <p class="text-xs text-muted-foreground">
            Recipebase brings in a modern and user-focused interface to view
            each recipe, carefully crafted to let you focus on what matters when
            you cook.
          </p>
        </TabsTrigger>
        <TabsTrigger
          value="import"
          class="product-tab flex flex-col justify-center gap-1 p-5 text-start grid-in-tab2"
        >
          <h3 class="text-base">Aggregate recipes from anywhere</h3>
          <p class="text-xs text-muted-foreground">
            Recipebase lets you easily import any recipe into your precious
            collection. Whether you discovered it in a book, an old, never
            updated, blog article from 2011 or well-known recipe website, you
            can add it here!
          </p>
        </TabsTrigger>
        <TabsTrigger
          value="organize"
          class="product-tab flex flex-col justify-center gap-1 p-5 text-start grid-in-tab3"
        >
          <h3 class="text-base">Organize your recipes</h3>
          <p class="text-xs text-muted-foreground">
            Because organizing is caring, you can tag your recipes to help find
            them in a bliss later on.
          </p>
        </TabsTrigger>

        <TabsContent value="recipe" class="bg-gray-950 grid-in-content">
          <div
            class="relative m-4 size-[calc(100%_-_2rem)] h-full overflow-hidden gradient-mask-b-10 max-md:h-96"
          >
            <div
              class="pointer-events-none absolute inset-0 -left-1/4 size-[150%] min-w-container origin-[top_center] scale-[66.66%]"
            >
              <RecipePage :recipe="exampleRecipe" hide-comments />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="import" class="bg-gray-950 grid-in-content">
          <div
            class="relative m-4 size-[calc(100%_-_2rem)] h-full overflow-hidden gradient-mask-b-10 max-md:h-72"
          >
            <div
              class="pointer-events-none absolute -left-1/4 size-[150%] origin-[top_center] scale-[66.66%]"
            >
              <FakeImportPage />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="organize" class="bg-gray-950 grid-in-content">
          <div
            class="relative m-4 size-[calc(100%_-_2rem)] h-full overflow-hidden gradient-mask-b-10 max-md:h-72"
          >
            <div
              class="pointer-events-none absolute -left-1/4 size-[150%] origin-[top_center] scale-[66.66%]"
            >
              <RecipeListPage :recipes="recipeList" />
            </div>
          </div>
        </TabsContent>
      </TabsList>
    </TabsRoot>
  </div>
</template>

<script setup lang="ts">
import exampleRecipe from "~/components/homepage/product/exampleRecipe";
import FakeImportPage from "~/components/recipe/import/FakeImportPage.vue";
import { RecipePage } from "~/components/recipe/view";
import RecipeListPage from "~/components/recipe/list/RecipeListPage.vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "radix-vue";
import { recipeList } from "~/components/homepage/product/exampleRecipeList";

const selectedTab = ref("recipe");
</script>
