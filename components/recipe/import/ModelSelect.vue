<template>
  <Select v-model="currentModel" :disabled>
    <SelectTrigger class="flex w-auto gap-2 border-none px-0 select-none">
      <template v-if="currentModel">
        <span class="text-muted-foreground">Model:</span>

        {{ currentModel }}
      </template>
      <template v-else>Please select a model</template>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="model in items" :key="model" :value="model">
        {{ model }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
<script lang="ts" setup>
const currentModel = defineModel<string>();

defineProps<{
  disabled: boolean;
  items: Set<string>;
}>();
</script>
