<script setup lang="ts">
import { cn } from "@/lib/utils";
import { PaginationEllipsis, type PaginationEllipsisProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";
import { EllipsisIcon } from "lucide-vue-next";

const props = defineProps<
  PaginationEllipsisProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <PaginationEllipsis
    v-bind="delegatedProps"
    :class="cn('flex h-9 w-9 items-center justify-center', props.class)"
  >
    <slot>
      <EllipsisIcon />
    </slot>
  </PaginationEllipsis>
</template>
