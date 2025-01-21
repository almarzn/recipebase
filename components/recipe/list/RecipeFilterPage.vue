<script setup lang="ts">
import { Tags } from "~/lib/Tags";
import type { RecipeQuery } from "~/lib/Recipes";
import {
  CheckboxRoot,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "radix-vue";
import { ChevronsUpDown, LucideTags, CheckIcon } from "lucide-vue-next";
import TagIcon from "~/components/recipe/TagIcon.vue";

const model = defineModel<RecipeQuery>();

const client = useSupabaseClient();

const { data: allTags, status } = await useAsyncData("tagsWithCount", () =>
  Tags.using(client).findAllWithRecipeCount(),
);

const updateTag = (id: string, value: boolean) => {
  if (value) {
    model.value = {
      withTags: [...(model.value?.withTags ?? []), id],
    };
  } else {
    model.value = {
      withTags: model.value?.withTags!.filter((it) => it !== id),
    };
  }
};
</script>

<template>
  <CollapsibleRoot
    class="group/collapsible flex flex-col gap-3 rounded-md md:border md:px-3 md:py-4"
    default-open
  >
    <CollapsibleTrigger class="flex items-center gap-2 px-2">
      <div class="size-3 text-muted-foreground">
        <LucideTags class="size-3" />
      </div>
      <div class="text-xs uppercase text-muted-foreground">Tags</div>
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
        :checked="modelValue?.withTags?.includes(tag.id)"
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
</template>
