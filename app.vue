<template>
  <div class="flex min-h-lvh w-lvw flex-col items-stretch bg-radial">
    <NuxtLoadingIndicator />

    <NavigationBar />

    <NuxtPage />

    <PageFooter />

    <Toaster class="pointer-events-auto" />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import NavigationBar from "~/components/layout/NavigationBar.vue";
import PageFooter from "~/components/layout/PageFooter.vue";

useHead({
  titleTemplate: (str) => (str ? `${str} | Recipebase` : "Recipebase"),
});
</script>
