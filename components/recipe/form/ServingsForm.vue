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
  NumberField,
  NumberFieldContent,
  NumberFieldIncrement,
  NumberFieldDecrement,
  NumberFieldInput,
} from "~/components/ui/number-field";
</script>

<template>
  <FormField v-slot="{ componentField }" name="servings.amount">
    <FormItem>
      <FormLabel>Serving count</FormLabel>
      <FormControl>
        <NumberField
          class="w-40"
          :default-value="2"
          :format-options="{
            signDisplay: 'never',
            maximumFractionDigits: 2,
          }"
          :step="0.5"
          v-bind="componentField"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </FormControl>
      <FormDescription>
        The amount of servings you can expected for the ingredient quantities
        specified.
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="servings.notes">
    <FormItem>
      <FormLabel>Additional notes</FormLabel>
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
