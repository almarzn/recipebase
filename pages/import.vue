<script setup lang="ts">
import ImportPage from "~/components/recipe/import/ImportPage.vue";
import { AdaptiveBreadcrumbs } from "~/components/layout";
import PageLayout from "~/components/layout/PageLayout.vue";
</script>

<template>
  <PageLayout>
    <AdaptiveBreadcrumbs
      :items="[
        { to: '/', text: 'Home' },
        { text: 'Recipes', to: 'recipes' },
        { text: 'Import recipe' },
      ]"
    />
    <ImportPage />
  </PageLayout>
</template>
