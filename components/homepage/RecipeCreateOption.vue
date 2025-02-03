<script setup lang="ts">
import { Button } from "~/components/ui/button";
import type { LucideIcon } from "lucide-vue-next";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
}

defineProps<Props>();
</script>

<template>
  <Button
    class="group flex h-auto items-center gap-3 px-5 py-3 text-start whitespace-normal"
    variant="outline"
    as-child
    :data-size="size"
  >
    <NuxtLink :to="to">
      <component :is="icon" />
      <div class="flex grow flex-col">
        <h5 class="">{{ title }}</h5>
        <p class="text-xs text-muted-foreground">
          {{ description }}
        </p>
      </div>
    </NuxtLink>
  </Button>
</template>
