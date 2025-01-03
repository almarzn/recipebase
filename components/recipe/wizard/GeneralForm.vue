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
</script>

<template>
  <h4 class="heading-4">General</h4>
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
</template>
