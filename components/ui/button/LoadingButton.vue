<script lang="ts" setup>
import type { ButtonProps } from "~/components/ui/button/Button.vue";
import SpinnerButton from "~/components/ui/button/SpinnerButton.vue";

const { action, ...props } = defineProps<
  {
    action: () => Promise<unknown>;
  } & Omit<ButtonProps, "loading">
>();
const loading = ref(false);
</script>

<template>
  <SpinnerButton
    :loading
    v-bind="props"
    @click="
      loading = true;
      action().finally(() => (loading = false));
    "
  >
    <slot />
  </SpinnerButton>
</template>
