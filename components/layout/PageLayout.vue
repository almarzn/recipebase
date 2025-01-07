<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="max-w-screen-xl flex flex-col gap-1 items-stretch w-full self-center p-4"
  >
    <div class="flex flex-col gap-8">
      <slot />
    </div>
  </div>
</template>
