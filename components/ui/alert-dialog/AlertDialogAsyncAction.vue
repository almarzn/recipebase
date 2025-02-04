<script setup lang="ts">
import type { AlertDialogActionProps } from "radix-vue";
import type { HTMLAttributes } from "vue";
import { openState } from "~/components/ui/alert-dialog/openState";

const props = defineProps<
  AlertDialogActionProps & {
    class?: HTMLAttributes["class"];
    action: () => Promise<void>;
  }
>();

const loading = ref(false);
const opened = inject(openState);

const click = () => {
  loading.value = true;
  props
    .action()
    .finally(() => (loading.value = false))
    .then(() => {
      opened.value = false;
    });
};
</script>

<template>
  <SpinnerButton :class="props.class" :loading @click="click">
    <slot />
  </SpinnerButton>
</template>
