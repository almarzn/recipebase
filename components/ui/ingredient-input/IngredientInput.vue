<script setup lang="ts">
import type { Ingredient } from "~/types/recipe";
import { Field } from "vee-validate";
import { FormControl, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Trash2 } from "lucide-vue-next";
import { UnitFormatter } from "~/lib/Unit";
import { UnitSelect } from "~/components/ui/unit-select";

defineEmits(["delete"]);
defineModel<Ingredient>();
defineProps<{ name: string; as?: string }>();
</script>

<template>
  <Component :is="as ?? 'div'" class="col-span-5 grid grid-cols-subgrid">
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
      <FormItem class="space-y-0">
        <FormControl class="group">
          <Input
            v-bind="componentField"
            placeholder="Additional informations"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </Field>
    <Button variant="ghost" class="aspect-square p-2" @click="$emit('delete')">
      <Trash2 />
    </Button>
  </Component>
</template>
