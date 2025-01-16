<script setup lang="ts">
import type { Ingredient } from "~/types/recipe";
import { Field } from "vee-validate";
import { FormControl, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Trash2, NotepadText, Dot } from "lucide-vue-next";
import { UnitSelect } from "~/components/ui/unit-select";
import { Textarea } from "~/components/ui/textarea";
import IconBadge from "~/components/ui/icon-badge/IconBadge.vue";

defineEmits(["delete"]);
defineProps<{ name: string; as?: string }>();
</script>

<template>
  <Component :is="as ?? 'div'" class="col-span-6 grid grid-cols-subgrid">
    <Field v-slot="{ componentField }" :name="`${name}.quantity`">
      <Input v-bind="componentField" class="w-16" />
    </Field>
    <Field v-slot="{ componentField }" :name="`${name}.unit`">
      <UnitSelect v-bind="componentField" />
    </Field>
    <Field v-slot="{ componentField }" :name="`${name}.name`">
      <FormItem class="space-y-0">
        <FormControl class="group">
          <Input v-bind="componentField" placeholder="Name of the ingredient" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </Field>
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
              Add additional informations about this ingredient.
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
  </Component>
</template>
