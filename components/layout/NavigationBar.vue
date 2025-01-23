<script setup lang="ts">
import UserNavigationBar from "~/components/layout/UserNavigationBar.vue";

const user = useSupabaseUser();
</script>

<template>
  <UserNavigationBar v-if="!user" />
</template>
