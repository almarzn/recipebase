<template>
  <Sheet @update:open="(bool) => !bool && $emit('closeSheet')">
    <SheetTrigger as-child>
      <slot>
        <Button variant="link" class="p-0 text-purple-200 underline">
          Edit tags
        </Button>
      </slot>
    </SheetTrigger>
    <SheetContent>
      <SheetTitle>Edit tags</SheetTitle>

      <TagSettings />
    </SheetContent>
  </Sheet>
</template>
<script setup lang="ts">
import TagSettings from "~/components/profile/TagSettings.vue";

defineEmits<{
  closeSheet: [];
}>();
</script>
