<script lang="ts" setup>
import type { StepperTriggerProps } from "radix-vue";
import { cn } from "@/lib/utils";
import { StepperTrigger, useForwardProps } from "radix-vue";

import { computed, type HTMLAttributes } from "vue";

const props = defineProps<
  StepperTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <StepperTrigger v-bind="forwarded" :class="cn('rounded-md p-1', props.class)">
    <slot />
  </StepperTrigger>
</template>
