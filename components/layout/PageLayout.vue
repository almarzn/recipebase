<script setup lang="ts">
import { cn } from "~/lib/utils";

defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    :class="
      cn(
        'flex w-full max-w-screen-xl grow flex-col items-stretch gap-1 self-center p-4 md:px-8',
        $props.class,
      )
    "
  >
    <div class="flex grow flex-col gap-8">
      <slot />
    </div>
  </div>
</template>
