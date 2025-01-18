<script setup lang="ts">
import EditableComment from "~/components/recipe/view/EditableComment.vue";
import { useElementBounding } from "@vueuse/core";

function getScrollParent(node: HTMLElement) {
  const isElement = node instanceof HTMLElement;
  const overflowY = isElement && window.getComputedStyle(node).overflowY;
  const isScrollable = overflowY !== "visible" && overflowY !== "hidden";

  if (!node) {
    return null;
  } else if (isScrollable && node.scrollHeight >= node.clientHeight) {
    return node as HTMLElement;
  }

  return getScrollParent(node.parentNode as HTMLElement) || document.body;
}

const hover = defineModel<boolean>("hover");

const props = defineProps<{
  comments: {
    content: string;
    id: string;
    isNew?: boolean;
    created_at: Date;
  }[];
  commentTo: HTMLElement | null;
  alignWith: HTMLElement | null;
}>();

defineEmits<{
  addComment: [];
  updateComment: [id: string, content: string];
  deleteComment: [id: string];
}>();

const commentsDiv = useTemplateRef("commentsDiv");
const parentBounds = useElementBounding(props.commentTo, {});
const alignWithBounds = useElementBounding(props.alignWith, {});
const previousSibling = useElementBounding(
  computed(() => commentsDiv.value?.previousElementSibling as HTMLElement),
  {},
);

const scrollParent = computed(
  () => commentsDiv.value && getScrollParent(commentsDiv.value),
);

const offset = computed(() => {
  const previousOffset =
    previousSibling.bottom.value -
    parentBounds.top.value +
    8 -
    (scrollParent.value?.scrollTop ?? 0);
  const alignOffset = alignWithBounds.top.value - parentBounds.top.value;
  return Math.max(previousOffset, alignOffset);
});
</script>

<template>
  <Teleport v-if="commentTo" :to="commentTo">
    <div
      ref="commentsDiv"
      class="group/comment-container absolute flex w-full flex-col gap-2 transition-colors"
      :style="`top: ${Math.max(offset)}px;`"
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
</template>
