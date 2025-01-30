<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginationNext, type PaginationNextProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";
import { ChevronRightIcon } from "lucide-vue-next";
const props = withDefaults(
  defineProps<PaginationNextProps & { class?: HTMLAttributes["class"] }>(),
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
  <PaginationNext v-bind="delegatedProps">
    <Button :class="cn('h-9 w-9 p-0', props.class)" variant="outline">
      <slot>
        <ChevronRightIcon />
      </slot>
    </Button>
  </PaginationNext>
</template>
