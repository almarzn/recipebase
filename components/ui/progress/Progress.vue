<script setup lang="ts">
import { cn } from "@/lib/utils";
import {
  ProgressIndicator,
  ProgressRoot,
  type ProgressRootProps,
} from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<
    ProgressRootProps & {
      class?: HTMLAttributes["class"];
      indeterminate?: true;
    }
  >(),
  {
    modelValue: 0,
  },
);

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <ProgressRoot
    v-bind="delegatedProps"
    :class="
      cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        props.class,
      )
    "
  >
    <ProgressIndicator
      class="data-[indeterminate=true]:animate-progress size-full flex-1 bg-primary transition-transform data-[indeterminate=true]:origin-left"
      :style="`transform: translateX(-${100 - (props.modelValue ?? 0)}%); transition-duration: 1s;`"
      :data-indeterminate="indeterminate"
    />
  </ProgressRoot>
</template>
