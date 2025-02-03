<script setup lang="ts">
import {
  TagsInput,
  TagsInputInput,
  TagsInputItemDelete,
} from "~/components/ui/tags-input";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
  TagsInputItem,
} from "radix-vue";
import { computed, ref } from "vue";
import { Tags } from "~/lib/Tags";
import RecipeTag from "~/components/recipe/RecipeTag.vue";
import { keyBy } from "lodash";

const props = defineProps<{
  modelValue: string[]
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>();

const open = ref(false);
const searchTerm = ref("");
const client = useSupabaseClient();

const tags = await useAsyncData(() => Tags.using(client).findAll(), {
  lazy: true,
});

const filteredTags = computed(() => {
  const filter = searchTerm.value ?? "";
  return (
    tags.data.value?.filter((it) =>
      it.text.toLowerCase().includes(filter.toLowerCase()),
    ) ?? []
  );
});

const tagsById = computed(() => keyBy(tags.data.value, "id"));

const refreshTags = () => {
  tags.refresh();
};
</script>

<template>
  <TagsInput
    :model-value="modelValue"
    class="w-80 gap-0 px-0"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-wrap items-center gap-2 px-3">
      <TagsInputItem v-for="item in modelValue" :key="item" :value="item">
        <RecipeTag v-if="tagsById[item]" :tag="tagsById[item]">
          <TagsInputItemDelete class="mr-0" />
        </RecipeTag>
      </TagsInputItem>
    </div>

    <ComboboxRoot
      v-model:open="open"
      v-model:search-term="searchTerm"
      :model-value="modelValue"
      class="w-full"
    >
      <ComboboxAnchor as-child>
        <ComboboxInput placeholder="Tags..." as-child>
          <TagsInputInput
            class="w-full px-3"
            :class="modelValue.length > 0 ? 'mt-2' : ''"
            @keydown.enter.prevent
            @focus="open = true"
          />
        </ComboboxInput>
      </ComboboxAnchor>

      <ComboboxPortal>
        <ComboboxContent>
          <CommandList
            position="popper"
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 mt-2 w-[--radix-popper-anchor-width] rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
          >
            <CommandEmpty />
            <CommandGroup>
              <CommandItem
                v-for="tag in filteredTags?.filter(
                  (it) => !modelValue?.includes(it.id),
                )"
                :key="tag.id"
                :value="tag.text"
                @select.prevent="
                  (ev) => {
                    if (typeof ev.detail.value === 'string') {
                      searchTerm = '';
                      emit('update:modelValue', [...modelValue, tag.id]);
                    }

                    if (filteredTags?.length === 0) {
                      open = false;
                    }
                  }
                "
              >
                {{ tag.text }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </TagsInput>
</template> 