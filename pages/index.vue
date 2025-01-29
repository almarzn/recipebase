<template>
  <PageLayout v-if="user" class="max-md:p-0">
    <UserHomePage />
  </PageLayout>
  <ProductHomepage v-else />
</template>

<script setup lang="ts">
import UserHomePage from "~/components/homepage/UserHomePage.vue";
import PageLayout from "~/components/layout/PageLayout.vue";
import ProductHomepage from "~/components/homepage/product/ProductHomepage.vue";
const user = useSupabaseUser();
</script>
