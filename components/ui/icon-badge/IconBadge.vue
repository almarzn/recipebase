<script setup lang="ts">
defineProps<{ active: boolean }>();
</script>

<template>
  <div class="relative size-4">
    <slot />
    <div
      v-if="active"
      class="absolute bottom-0 right-0 flex size-2 items-center justify-center rounded-full bg-black"
    >
      <div class="size-1.5 rounded-full bg-purple-500" />
    </div>
  </div>
</template>

<style scoped></style>
