<template>
  <div class="bg-radial flex h-lvh w-lvw flex-col items-stretch">
    <NuxtLoadingIndicator />

    <NavigationBar />

    <NuxtPage />

    <Toaster class="pointer-events-auto" />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import NavigationBar from "~/components/layout/NavigationBar.vue";

useHead({
  titleTemplate: (str) => (str ? `${str} | Recipebase` : "Recipebase"),
});
</script>
