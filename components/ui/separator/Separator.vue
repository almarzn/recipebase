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
        'shrink-0 flex items-center',
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
          'text-xs text-muted-foreground flex justify-center items-center',
          props.orientation === 'vertical' ? 'px-1 py-2' : 'py-1 px-2',
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
