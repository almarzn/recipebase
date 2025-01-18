<script setup lang="ts">
import type { Step } from "~/types/recipe";
import { MessageCirclePlus } from "lucide-vue-next";
import StepCommentsSideLayout from "~/components/recipe/view/StepComments.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const { commentTo } = defineProps<{
  step: Step;
  comments: {
    content: string;
    id: string;
    isNew?: boolean;
    created_at: Date;
  }[];
  commentTo: HTMLElement | null;
  commentLayout: "side" | "none";
}>();
defineEmits<{
  addComment: [];
  updateComment: [id: string, content: string];
  deleteComment: [id: string];
}>();
const item = useTemplateRef("item");

const hover = ref(false);
</script>

<template>
  <li ref="item" class="group">
    <div
      class="flex items-center justify-between rounded-md p-1 pl-3 transition-colors group-hover:bg-gray-900 data-[hover=true]:bg-gray-900"
      :data-hover="hover"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <div class="block p-1 pl-0">
        {{ step.text }}
        <div v-if="step.notes" class="col-span-3 text-xs text-muted-foreground">
          {{ step.notes }}
        </div>
      </div>
      <Button
        variant="ghost"
        class="h-auto self-stretch opacity-0 transition-opacity group-hover:opacity-100"
        @click="$emit('addComment')"
      >
        <MessageCirclePlus />
      </Button>
    </div>
    <ClientOnly>
      <StepCommentsSideLayout
        v-if="commentLayout === 'side'"
        v-model:hover="hover"
        :comments
        :comment-to
        :align-with="item"
        @update-comment="(id, content) => $emit('updateComment', id, content)"
        @delete-comment="(id) => $emit('deleteComment', id)"
      />
    </ClientOnly>
  </li>
</template>
