<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Primitive, type PrimitiveProps } from "radix-vue";
import { NuxtLink } from "#components";
import type { NavigateToOptions } from "#app/composables/router";
import type { RawNavConfig } from "@redocly/config";
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
