<template>
  <EditableRoot
    v-slot="{ isEditing, modelValue }"
    :default-value="comment.content"
    placeholder="Enter text..."
    class="group/comment flex flex-col gap-0 rounded-md border px-3 pt-2 pb-3 group-data-[hover=true]/comment-container:bg-gray-900"
    auto-resize
    :start-with-edit-mode="defaultEditing"
    submit-mode="enter"
    @submit="(value) => $emit('update', value)"
  >
    <div
      class="flex items-center gap-1 opacity-30 group-hover/comment:opacity-100"
    >
      <div class="text-xs text-muted-foreground">
        <UseTimeAgo v-slot="{ timeAgo }" :time="comment.created_at">
          {{ timeAgo }}
        </UseTimeAgo>
      </div>

      <div class="grow"></div>
      <template v-if="!isEditing">
        <EditableEditTrigger as-child>
          <Button
            class="h-auto p-1 opacity-0 group-hover/comment:opacity-100"
            variant="ghost"
          >
            <Pen class="size-3" />
          </Button>
        </EditableEditTrigger>
        <Button
          class="h-auto p-1 text-destructive opacity-0 group-hover/comment:opacity-100"
          variant="ghost"
          @click="$emit('delete')"
        >
          <Trash class="size-3" />
        </Button>
      </template>
      <template v-else>
        <EditableSubmitTrigger as-child>
          <Button class="h-auto px-2 py-1 text-xs" variant="default">
            Save
          </Button>
        </EditableSubmitTrigger>
        <EditableCancelTrigger as-child>
          <Button class="!h-auto p-1 text-xs" variant="secondary">
            <Ban />
          </Button>
        </EditableCancelTrigger>
      </template>
    </div>
    <EditableArea
      class="text-sm text-muted-foreground group-data-[hover=true]/comment-container:text-foreground"
    >
      <EditablePreview class="!whitespace-pre-wrap">
        {{ modelValue + " " }}
      </EditablePreview>
      <EditableInput class="h-[initial] w-full" as="textarea" rows="1" />
    </EditableArea>
  </EditableRoot>
</template>

<script setup lang="ts">
import { Trash, Pen, Ban } from "lucide-vue-next";
import {
  EditableArea,
  EditableCancelTrigger,
  EditableEditTrigger,
  EditableInput,
  EditablePreview,
  EditableRoot,
  EditableSubmitTrigger,
} from "radix-vue";
import { UseTimeAgo } from "@vueuse/components";

defineProps<{
  comment: {
    created_at: Date;
    content: string;
  };
  defaultEditing: boolean;
}>();

defineEmits<{
  update: [string];
  delete: [];
}>();
</script>
