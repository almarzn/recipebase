<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import type { PrimitiveProps } from "radix-vue";
import { NuxtLink } from "#components";
import type { RouteLocationRaw } from "#vue-router";

const props = withDefaults(
  defineProps<
    PrimitiveProps & { class?: HTMLAttributes["class"]; to: RouteLocationRaw }
  >(),
  {
    as: NuxtLink,
  },
);
</script>

<template>
  <NuxtLink
    :to
    :class="cn('transition-colors hover:text-foreground', props.class)"
  >
    <slot />
  </NuxtLink>
</template>
