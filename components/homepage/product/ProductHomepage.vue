<script setup lang="ts">
import PageHero from "~/components/homepage/product/PageHero.vue";
import ProductFeatureTabs from "~/components/homepage/product/ProductFeatureTabs.vue";
import ProductOtherFeatures from "~/components/homepage/product/ProductOtherFeatures.vue";
</script>

<template>
  <div
    class="flex flex-col items-center bg-gradient-to-b from-transparent via-transparent to-gray-600/10 md:px-8"
  >
    <div class="flex w-full max-w-screen-xl flex-col gap-8 self-center">
      <PageHero />

      <ProductFeatureTabs />
    </div>
  </div>

  <div
    class="h-px self-stretch bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800"
  ></div>

  <div class="self-stretch">
    <ProductOtherFeatures />
  </div>
</template>

<style scoped></style>
