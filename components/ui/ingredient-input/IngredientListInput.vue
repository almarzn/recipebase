<script setup lang="ts">
import type { Ingredient } from "~/types/recipe";

const ingredients = defineModel<Ingredient[]>();
</script>
<template>
  <ul class="flex flex-col gap-2">
    <li v-for="(ingredient, index) in ingredients" :key="index" />
  </ul>
</template>
