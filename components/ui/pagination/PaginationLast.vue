<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginationLast, type PaginationLastProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";
import { ChevronsRight } from "lucide-vue-next";
const props = withDefaults(
  defineProps<PaginationLastProps & { class?: HTMLAttributes["class"] }>(),
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
  <PaginationLast v-bind="delegatedProps">
    <Button :class="cn('h-9 w-9 p-0', props.class)" variant="outline">
      <slot>
        <ChevronsRight />
      </slot>
    </Button>
  </PaginationLast>
</template>
