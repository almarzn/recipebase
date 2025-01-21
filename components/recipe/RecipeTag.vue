<script setup lang="ts">
import Tag from "~/components/ui/tag/Tag.vue";
import type { TagProps } from "~/types/recipe";
import TagIcon from "~/components/recipe/TagIcon.vue";

defineProps<{
  tag: TagProps;
}>();
</script>
<template>
  <Tag :color="tag.color">
    <TagIcon :tag class="size-3" />
    {{ tag.text }}
    <slot />
  </Tag>
</template>
