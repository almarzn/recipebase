<script setup lang="ts">
import { cn } from "~/lib/utils";
import colors from "tailwindcss/colors";
import { Primitive } from "radix-vue";

const props = defineProps<{
  class?: string;
  color:
    | "gray"
    | "zinc"
    | "slate"
    | "neutral"
    | "stone"
    | "red"
    | "orange"
    | "amber"
    | "yellow"
    | "lime"
    | "green"
    | "emerald"
    | "teal"
    | "cyan"
    | "sky"
    | "blue"
    | "indigo"
    | "violet"
    | "purple"
    | "fuchsia"
    | "pink"
    | "rose";
  asChild?: boolean;
  as?: string;
}>();
</script>

<template>
  <Primitive
    :as
    :as-child
    :class="
      cn(
        'inline-flex items-center gap-1 rounded-sm border-[1px] border-solid px-2 py-0.5 text-xs',
        props.class,
      )
    "
    :style="`
    background-color: color-mix(in srgb, ${colors[color]?.['800']} 30%, transparent);
    border-color: ${colors[color]?.['800']};
    color: ${colors[color]?.['200']}
    `"
  >
    <slot />
  </Primitive>
</template>
