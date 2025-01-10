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
      class="size-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 group-disabled:cursor-not-allowed group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground"
    >
      <CheckboxIndicator
        class="flex size-full items-center justify-center text-current"
      >
        <CheckIcon class="size-4" />
      </CheckboxIndicator>
    </div>

    <slot />
  </CheckboxRoot>
</template>
