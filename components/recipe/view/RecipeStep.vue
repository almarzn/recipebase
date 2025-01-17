<script setup lang="ts">
import type { Step } from "~/types/recipe";
import { MessageCirclePlus } from "lucide-vue-next";
import { onWatcherCleanup } from "vue";
import EditableComment from "~/components/recipe/view/EditableComment.vue";

const { commentTo } = defineProps<{
  step: Step;
  comments: {
    content: string;
    id: string;
    isNew?: boolean;
    created_at: Date;
  }[];
  commentTo: HTMLElement | null;
}>();
defineEmits<{
  addComment: [];
  updateComment: [id: string, content: string];
  deleteComment: [id: string];
}>();
const item = useTemplateRef("item");

const commentsDiv = useTemplateRef("commentsDiv");

const previousOffset = ref(0);

const gap = 8;

watch(
  () => commentsDiv.value,
  () => {
    const previousElementSibling = commentsDiv.value?.previousElementSibling;

    const updateOffset = () => {
      if (previousElementSibling instanceof HTMLElement) {
        previousOffset.value =
          previousElementSibling.getBoundingClientRect().bottom -
          commentTo!.getBoundingClientRect().top +
          gap;
      }
    };

    const resizeObserver = new ResizeObserver(updateOffset);
    const mutationObserver = new MutationObserver(updateOffset);

    if (previousElementSibling instanceof HTMLElement) {
      updateOffset();

      resizeObserver.observe(previousElementSibling!, {});
      mutationObserver.observe(previousElementSibling!, {
        attributes: true,
        attributeFilter: ["style"],
        subtree: false,
      });
    }

    onWatcherCleanup(() => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    });
  },
);
const hover = ref(false);
</script>

<template>
  <li ref="item" class="group">
    <div
      class="flex items-center justify-between rounded-md pl-3 transition-colors group-hover:bg-gray-900 data-[hover=true]:bg-gray-900"
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
        class="h-auto self-stretch rounded-l-none opacity-0 transition-opacity group-hover:opacity-100"
        @click="$emit('addComment')"
      >
        <MessageCirclePlus />
      </Button>
    </div>
    <Teleport v-if="commentTo" :to="commentTo">
      <div
        ref="commentsDiv"
        class="group/comment-container absolute flex w-full flex-col gap-2 transition-colors"
        :style="`top: ${Math.max(previousOffset, (item?.getBoundingClientRect().top ?? 0) - commentTo.getBoundingClientRect().top)}px; opacity: ${item ? '1' : '0'}`"
        :data-hover="hover"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
      >
        <div v-for="comment in comments" ref="commentsDiv" :key="comment.id">
          <EditableComment
            :comment
            :default-editing="!!comment.isNew"
            @update="(value) => $emit('updateComment', comment.id, value)"
            @delete="
              $emit('deleteComment', comment.id);
              hover = false;
            "
          />
        </div>
      </div>
    </Teleport>
  </li>
</template>
