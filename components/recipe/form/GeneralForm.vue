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
import TagSettingSheet from "~/components/profile/TagSettingSheet.vue";
import RecipeTagsInput from "~/components/recipe/form/RecipeTagsInput.vue";

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
  <FormField v-slot="{ componentField }" name="tags">
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <FormControl>
        <RecipeTagsInput ref="tagsInput" v-bind="componentField" />
      </FormControl>
      <FormDescription>
        Tag this recipe to help you organize them. Click
        <TagSettingSheet @close-sheet="$refs.tagsInput?.refreshTags()">
          <span
            class="cursor-pointer text-foreground underline underline-offset-4"
          >
            here to edit tags
          </span>
        </TagSettingSheet>
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="metadata.original_url">
    <FormItem>
      <FormLabel>Original URL</FormLabel>
      <FormControl>
        <Input type="text" v-bind="componentField" />
      </FormControl>
      <FormMessage />
      <FormDescription>
        The original URL of the recipe. Optional.
      </FormDescription>
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="metadata.original_author">
    <FormItem>
      <FormLabel>Original author</FormLabel>
      <FormControl>
        <Input type="text" v-bind="componentField" />
      </FormControl>
      <FormMessage />
      <FormDescription>
        The original author of the recipe. Optional.
      </FormDescription>
    </FormItem>
  </FormField>
</template>
