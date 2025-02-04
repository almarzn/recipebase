<script lang="ts" setup>
import {
  type AlertDialogEmits,
  type AlertDialogProps,
  AlertDialogRoot,
  useForwardPropsEmits,
} from "radix-vue";
import { openState } from "~/components/ui/alert-dialog/openState";

const props = defineProps<AlertDialogProps>();
const emits = defineEmits<AlertDialogEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const opened = ref(false);

provide(openState, opened);
</script>

<template>
  <AlertDialogRoot v-bind="forwarded" v-model:open="opened">
    <slot />
  </AlertDialogRoot>
</template>
