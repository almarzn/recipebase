<script setup lang="ts">
import { cn } from "~/lib/utils.js";
import type { HTMLAttributes } from "vue";
import type { Props } from "./Button.vue";

import { Loader } from "lucide-vue-next";

export interface SpinnerButtonProps extends Props {
  classes?: Partial<Record<"base" | "content", HTMLAttributes["class"]>>;
  loading?: boolean;
  disabled?: boolean;
}

const { classes, loading, disabled, ...props } =
  defineProps<SpinnerButtonProps>();
</script>

<template>
  <Button
    v-bind="props"
    :class="
      cn(
        `grid-stack inline-grid place-content-center group`,
        $props.class,
        $props.classes?.base,
      )
    "
    :disabled="loading || disabled"
    :data-loading="loading"
  >
    <div
      class="flex items-center justify-center opacity-0 transition-opacity group-data-[loading=true]:opacity-100"
    >
      <slot name="loader">
        <Loader class="animate-spin" />
      </slot>
    </div>
    <div
      :class="
        cn(
          'flex items-center justify-center gap-2 transition-opacity group-data-[loading=true]:opacity-0',
          $props.classes?.content,
        )
      "
    >
      <slot />
    </div>
  </Button>
</template>
