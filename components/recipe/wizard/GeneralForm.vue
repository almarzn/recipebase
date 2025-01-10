<script setup lang="ts">
import { Textarea } from "~/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
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

const open = ref(false);
const searchTerm = ref("");
const client = useSupabaseClient();

const tags = await useAsyncData(() => Tags.using(client).findAll(), {
  lazy: true,
});

const filteredTags = computed(() => {
  const filter = searchTerm.value ?? "";
  return tags.data.value?.filter((it) =>
    it.text.toLowerCase().includes(filter.toLowerCase()),
  );
});

const tagsById = computed(() => keyBy(tags.data.value, "id"));
</script>

<template>
  <FormField v-slot="{ componentField }" name="name">
    <FormItem>
      <FormLabel>Recipe name</FormLabel>
      <FormControl>
        <Input
          type="text"
          placeholder="Deep-fried tofu"
          v-bind="componentField"
        />
      </FormControl>
      <FormDescription>This is the name of the recipe.</FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="description">
    <FormItem>
      <FormLabel>Recipe description</FormLabel>
      <FormControl>
        <Textarea v-bind="componentField" />
      </FormControl>
      <FormDescription>
        Add some details or general tips about the recipe
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ value, setValue }" name="tags">
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <FormControl>
        <TagsInput
          :model-value="value"
          class="px-0 gap-0 w-80"
          @update:model-value="setValue($event)"
        >
          <div class="flex gap-2 flex-wrap items-center px-3">
            <TagsInputItem v-for="item in value" :key="item" :value="item">
              <RecipeTag :tag="tagsById[item]">
                <TagsInputItemDelete class="mr-0" />
              </RecipeTag>
            </TagsInputItem>
          </div>

          <ComboboxRoot
            v-model:open="open"
            v-model:search-term="searchTerm"
            :model-value="value"
            class="w-full"
          >
            <ComboboxAnchor as-child>
              <ComboboxInput placeholder="Tags..." as-child>
                <TagsInputInput
                  class="w-full px-3"
                  :class="value.length > 0 ? 'mt-2' : ''"
                  @keydown.enter.prevent
                  @focus="open = true"
                />
              </ComboboxInput>
            </ComboboxAnchor>

            <ComboboxPortal>
              <ComboboxContent>
                <CommandList
                  position="popper"
                  class="w-[--radix-popper-anchor-width] rounded-md mt-2 border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                  <CommandEmpty />
                  <CommandGroup>
                    <CommandItem
                      v-for="tag in filteredTags?.filter(
                        (it) => !value.includes(it.id),
                      )"
                      :key="tag.id"
                      :value="tag.text"
                      @select.prevent="
                        (ev) => {
                          if (typeof ev.detail.value === 'string') {
                            searchTerm = '';
                            value.push(tag.id);
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
      </FormControl>
      <FormDescription>
        Tag this recipe to help you organize them.
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
