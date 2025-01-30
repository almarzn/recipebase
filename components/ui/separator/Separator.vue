<script setup lang="ts">
import { cn } from "@/lib/utils";
import { Separator, type SeparatorProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<
  SeparatorProps & { class?: HTMLAttributes["class"]; label?: string }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <Separator
    v-bind="delegatedProps"
    :class="
      cn(
        'flex shrink-0 items-center',
        props.orientation === 'vertical' ? 'flex-col' : '',
        props.class,
      )
    "
  >
    <span
      :class="
        cn('grow bg-border', props.orientation === 'vertical' ? 'w-px' : 'h-px')
      "
    ></span>
    <span
      v-if="props.label"
      :class="
        cn(
          'flex items-center justify-center text-xs text-muted-foreground',
          props.orientation === 'vertical' ? 'px-1 py-2' : 'px-2 py-1',
        )
      "
      >{{ props.label }}</span
    >
    <span
      :class="
        cn('grow bg-border', props.orientation === 'vertical' ? 'w-px' : 'h-px')
      "
    ></span>
  </Separator>
</template>
