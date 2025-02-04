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
import TagSettingSheet from "~/components/profile/TagSettingSheet.vue";
import RecipeTagsInput from "~/components/recipe/form/RecipeTagsInput.vue";
import type { ComponentFieldBindingObject } from "vee-validate";
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
        <RecipeTagsInput
          ref="tagsInput"
          v-bind="componentField as ComponentFieldBindingObject<string[]>"
        />
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
