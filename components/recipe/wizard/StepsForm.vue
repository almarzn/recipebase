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
import type { Step } from "~/types/recipe";

const join = (value?: Step[]) => {
  return value?.map((el) => el.text)?.join("\n");
};

const split = (value?: string): Step[] | undefined => {
  return value?.split("\n").map((text) => ({ text }));
};
</script>

<template>
  <FormField v-slot="{ componentField, value }" name="steps">
    <FormItem>
      <FormLabel>Recipe steps</FormLabel>
      <FormControl>
        <Textarea
          class="h-64"
          :model-value="join(value)"
          @input="
            componentField['onUpdate:modelValue']!(
              split($event.currentTarget.value),
            )
          "
        />
      </FormControl>
      <FormDescription>
        Use one line per instruction. You do not need to add step numbers at the
        beginning.
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
