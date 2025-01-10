<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="flex w-full max-w-screen-xl flex-col items-stretch gap-1 self-center p-4"
  >
    <div class="flex flex-col gap-8">
      <slot />
    </div>
  </div>
</template>
