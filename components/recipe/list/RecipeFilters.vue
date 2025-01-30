<script setup lang="ts">
import { Tags } from "~/lib/Tags";
import type { RecipeQuery } from "~/lib/Recipes";
import {
  CheckboxRoot,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "radix-vue";
import { CheckIcon, ChevronsUpDown, SlidersHorizontal } from "lucide-vue-next";
import Input from "~/components/ui/input/Input.vue";
import TagIcon from "~/components/recipe/TagIcon.vue";
import { useVModel } from "@vueuse/core";
import AdaptiveSheet from "~/components/ui/sheet/AdaptiveSheet.vue";

const props = defineProps<{
  modelValue: RecipeQuery;
}>();
const emit = defineEmits<{
  "update:model-value": [RecipeQuery];
}>();

const vModel = useVModel(props, "modelValue", emit, {
  deep: true,
  passive: true,
});

const client = useSupabaseClient();

const { data: allTags } = await useAsyncData("tagsWithCount", () =>
  Tags.using(client).findAllWithRecipeCount(),
);

const updateTag = (id: string, value: boolean) => {
  if (value) {
    vModel.value.tags = [...(vModel.value?.tags ?? []), id];
  } else {
    vModel.value.tags = vModel!.value.tags!.filter((it) => it !== id);
  }
};
</script>

<template>
  <AdaptiveSheet
    class="flex min-w-64 flex-col gap-7"
    :icon="SlidersHorizontal"
    sheet-title="Filter results"
  >
    <Input v-model="vModel!.text" placeholder="Search recipes" />

    <CollapsibleRoot
      class="group/collapsible flex flex-col gap-3 rounded-md"
      default-open
    >
      <CollapsibleTrigger class="flex items-center gap-2 px-2">
        <div class="size-3 text-muted-foreground">
          <div class="size-3" />
        </div>
        <div class="text-xs text-muted-foreground uppercase">Tags</div>
        <div class="grow"></div>
        <ChevronsUpDown
          class="size-3.5 stroke-muted-foreground opacity-0 transition-opacity group-hover/collapsible:opacity-100"
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        class="flex items-stretch gap-2 max-md:flex-wrap md:flex-col"
      >
        <CheckboxRoot
          v-for="tag in allTags"
          :key="tag.id"
          v-slot="{ checked }"
          :checked="vModel?.tags?.includes(tag.id)"
          class="flex items-center gap-2 rounded-full px-3 py-1 text-start text-sm data-[state=checked]:bg-gray-800"
          @update:checked="(value) => updateTag(tag.id, value)"
        >
          <div class="md:size-3">
            <CheckIcon v-if="checked" class="size-3" />
            <TagIcon v-else :tag class="size-3 stroke-muted-foreground" />
          </div>

          {{ tag.text }}
          <div class="md:grow"></div>
          <div class="text-muted-foreground">({{ tag.recipes }})</div>
        </CheckboxRoot>
      </CollapsibleContent>
    </CollapsibleRoot>
  </AdaptiveSheet>
</template>
