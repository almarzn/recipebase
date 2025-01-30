<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginationFirst, type PaginationFirstProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";
import { ChevronsLeft } from "lucide-vue-next";
const props = withDefaults(
  defineProps<PaginationFirstProps & { class?: HTMLAttributes["class"] }>(),
  {
    asChild: true,
  },
);

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <PaginationFirst v-bind="delegatedProps">
    <Button :class="cn('h-9 w-9 p-0', props.class)" variant="outline">
      <slot>
        <ChevronsLeft />
      </slot>
    </Button>
  </PaginationFirst>
</template>
