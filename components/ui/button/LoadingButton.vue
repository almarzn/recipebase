<script lang="ts" setup>
import SpinnerButton from "~/components/ui/button/SpinnerButton.vue";
import type { Props } from "~/components/ui/button/Button.vue";

const { action, ...props } = defineProps<
  {
    action: () => Promise<unknown>;
  } & Omit<Props, "loading">
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
