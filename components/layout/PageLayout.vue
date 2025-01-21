<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="flex w-full max-w-screen-xl grow flex-col items-stretch gap-1 self-center overflow-scroll p-4 pt-0"
  >
    <div class="flex grow flex-col gap-8">
      <slot />
    </div>
  </div>
</template>
