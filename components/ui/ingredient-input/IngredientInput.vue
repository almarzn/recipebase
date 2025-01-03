<script setup lang="ts">
import type { Ingredient } from "~/types/recipe";
import { Field } from "vee-validate";
import { FormControl } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectLabel } from "~/components/ui/select";
import { Trash2 } from "lucide-vue-next";

defineEmits(["delete"]);
defineModel<Ingredient>();
defineProps<{ name: string }>();
</script>

<template>
  <div class="flex gap-1">
    <Field v-slot="{ componentField }" :name="`${name}.quantity`">
      <Input v-bind="componentField" class="w-16" />
    </Field>
    <Field v-slot="{ componentField }" :name="`${name}.unit`">
      <Select v-bind="componentField">
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>SI units</SelectLabel>
            <SelectItem value="GRAM">grams</SelectItem>
            <SelectItem value="KILOGRAM">kilograms</SelectItem>
            <SelectItem value="LITER">liters</SelectItem>
            <SelectItem value="MILLITER">milliliters</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
    <Field v-slot="{ componentField }" :name="`${name}.name`">
      <Input v-bind="componentField" />
    </Field>
    <Button variant="ghost" class="p-2 aspect-square" @click="$emit('delete')">
      <Trash2 />
    </Button>
  </div>
</template>
