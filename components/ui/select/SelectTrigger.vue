<script setup lang="ts">
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-vue-next";
import {
  SelectIcon,
  SelectTrigger,
  type SelectTriggerProps,
  useForwardProps,
} from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<
  SelectTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-start text-sm whitespace-nowrap shadow-sm ring-offset-background focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:truncate',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
