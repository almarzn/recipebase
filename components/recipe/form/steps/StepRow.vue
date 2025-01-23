<script setup lang="ts">
import { GripVertical, NotepadText, Trash2 } from "lucide-vue-next";
import { Textarea } from "~/components/ui/textarea";
import IconBadge from "~/components/ui/icon-badge/IconBadge.vue";
import { Field } from "vee-validate";

defineProps<{ name: string }>();
defineEmits(["delete"]);
</script>

<template>
  <div class="handle place-self-center text-muted-foreground">
    <GripVertical />
  </div>
  <div class="place-self-stretch">
    <FormField v-slot="{ componentField }" :name="`${name}.text`">
      <FormItem>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
  <Field v-slot="{ componentField }" :name="`${name}.notes`">
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="ghost" class="aspect-square p-2">
          <IconBadge :active="!!componentField.modelValue">
            <NotepadText class="stroke-muted-foreground" />
          </IconBadge>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div class="flex flex-col gap-2">
          <FormLabel>Notes</FormLabel>
          <Textarea v-bind="componentField" />
          <FormDescription>
            Add additional informations about this step.
          </FormDescription>
          <FormMessage />
        </div>
      </PopoverContent>
    </Popover>
  </Field>
  <div></div>
  <Button
    variant="ghost"
    class="aspect-square p-2"
    @click.prevent="$emit('delete')"
  >
    <Trash2 class="stroke-muted-foreground" />
  </Button>
</template>

<style scoped></style>
