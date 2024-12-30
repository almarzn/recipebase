<template>
  <h2
      :class="cn('', props.class)"
      v-if="level === 2"
  >
    <slot/>
  </h2>
</template>
<script setup lang="ts">
import {cn} from "@/lib/utils";

const props = defineProps<{ class: string, level: 2 }>()
</script>