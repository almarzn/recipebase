<script lang="ts" setup>
import type { ButtonProps } from "~/components/ui/button/Button.vue";

const { action, ...props } = defineProps<
  {
    action: () => Promise<unknown>;
  } & Omit<ButtonProps, "loading">
>();
const loading = ref(false);
</script>

<template>
  <Button
    :loading
    v-bind="props"
    @click="
      loading = true;
      action().finally(() => (loading = false));
    "
  >
    <slot />
  </Button>
</template>
