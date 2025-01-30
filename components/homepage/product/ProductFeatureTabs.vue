<template>
  <div
    class="w-full self-center overflow-hidden border border-b-0 max-md:border-x-0 md:rounded-t-xl"
  >
    <TabsRoot v-model="selectedTab">
      <TabsList
        class="responsive-tabs grid gap-px bg-border"
        :data-selected="selectedTab"
      >
        <TabsTrigger
          value="recipe"
          class="product-tab grid-in-tab1 flex flex-col justify-center gap-1 p-5 text-start"
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
          class="product-tab grid-in-tab2 flex flex-col justify-center gap-1 p-5 text-start"
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
          class="product-tab grid-in-tab3 flex flex-col justify-center gap-1 p-5 text-start"
        >
          <h3 class="text-base">Organize your recipes</h3>
          <p class="text-xs text-muted-foreground">
            Because organizing is caring, you can tag your recipes to help find
            them in a bliss later on.
          </p>
        </TabsTrigger>

        <TabsContent value="recipe" class="grid-in-content bg-gray-950">
          <div
            class="relative m-4 size-[calc(100%_-_2rem)] h-full overflow-hidden gradient-mask-b-60 max-md:h-96"
          >
            <div
              class="min-w-container pointer-events-none absolute inset-0 -left-1/4 size-[150%] origin-[top_center] scale-[66.66%]"
            >
              <RecipePage :recipe="exampleRecipe" hide-comments />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="import" class="grid-in-content bg-gray-950">
          <div
            class="relative m-4 size-[calc(100%_-_2rem)] h-full overflow-hidden gradient-mask-b-60 max-md:h-72"
          >
            <div
              class="pointer-events-none absolute -left-1/4 size-[150%] origin-[top_center] scale-[66.66%]"
            >
              <FakeImportPage />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="organize" class="grid-in-content bg-gray-950">
          <div
            class="relative m-4 size-[calc(100%_-_2rem)] h-full overflow-hidden gradient-mask-b-60 max-md:h-72"
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

<style scoped>
@reference "../../../assets/css/tailwind.css";

.responsive-tabs {
  grid-template-areas: "tab1 content" "tab2 content" "tab3 content";
  grid-template-columns: minmax(100px, 400px) 1fr;

  @variant max-md {
    @apply grid-cols-1;
    @variant data-[selected=recipe] {
      grid-template-areas: "tab1" "content" "tab2" "tab3";
    }
    @variant data-[selected=import] {
      grid-template-areas: "tab1" "tab2" "content" "tab3";
    }
    @variant data-[selected=organize] {
      grid-template-areas: "tab1" "tab2" "tab3" "content";
    }
  }
}

.grid-in-tab1 {
  grid-area: tab1;
}

.grid-in-tab2 {
  grid-area: tab2;
}

.grid-in-tab3 {
  grid-area: tab3;
}

.grid-in-content {
  grid-area: content;
}
</style>
