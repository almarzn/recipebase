<script setup lang="ts">
import UserNavigationBar from "~/components/layout/UserNavigationBar.vue";
import ProductNavigationBar from "~/components/layout/ProductNavigationBar.vue";

const user = useSupabaseUser();
</script>

<template>
  <UserNavigationBar v-if="user" />
  <ProductNavigationBar v-else />
</template>
