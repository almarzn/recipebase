<template>
  <create-form @create="onCreate" />
</template>
<script setup lang="ts">
import CreateForm from "~/components/recipe/form/CreateWizard.vue";

const onCreate = (slug: string) => {
  navigateTo({
    name: "recipes-slug",
    params: {
      slug,
    },
  });
};
</script>
