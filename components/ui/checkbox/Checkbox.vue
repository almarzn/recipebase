<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "radix-vue";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-vue-next";
import {
  CheckboxIndicator,
  CheckboxRoot,
  useForwardPropsEmits,
} from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<
  CheckboxRootProps & { class?: HTMLAttributes["class"] }
>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer group rounded-sm border data-[state=checked]:border-primary shadow flex items-center px-4 text-start ',
        props.class,
      )
    "
  >
    <div
      class="shrink-0 w-4 h-4 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group-disabled:cursor-not-allowed disabled:opacity-50 group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground"
    >
      <CheckboxIndicator
        class="flex h-full w-full items-center justify-center text-current"
      >
        <CheckIcon class="h-4 w-4" />
      </CheckboxIndicator>
    </div>

    <slot />
  </CheckboxRoot>
</template>
