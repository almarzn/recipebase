<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Primitive, type PrimitiveProps } from "radix-vue";
import { type ButtonVariants, buttonVariants } from ".";
import { Loader } from "lucide-vue-next";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn('group', buttonVariants({ variant, size }), props.class)"
    :disabled="disabled || loading"
    :data-loading="loading"
  >
    <div
      class="flex items-center justify-center opacity-0 group-data-[loading=true]:opacity-100 transition-opacity"
    >
      <slot name="loader">
        <Loader class="animate-spin" />
      </slot>
    </div>
    <div
      class="flex items-center justify-center gap-2 group-data-[loading=true]:opacity-0 transition-opacity"
    >
      <slot />
    </div>
  </Primitive>
</template>
