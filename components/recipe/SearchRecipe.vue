<script setup lang="ts">
import { cn } from "~/lib/utils";
import { SearchIcon } from "lucide-vue-next";

defineProps<{
  class?: string;
}>();

const getModifier = () => {
  if (
    navigator.platform.indexOf("Mac") === 0 ||
    navigator.platform === "iPhone"
  ) {
    return "⌘"; // command key
  }

  return "^";
};
</script>

<template>
  <Button
    variant="outline"
    :class="
      cn(
        'flex items-center justify-stretch gap-2 rounded-full border-2 bg-gray-500/5 text-muted-foreground backdrop-blur-xl max-md:self-stretch md:self-center',
        $props.class,
      )
    "
  >
    <SearchIcon />

    Search any recipe...

    <div class="grow"></div>

    <ClientOnly>
      <div class="rounded-sm border px-1 hover-none:hidden">
        {{ getModifier() }} K
      </div>
    </ClientOnly>
  </Button>
</template>
