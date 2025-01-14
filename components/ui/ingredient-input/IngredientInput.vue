<script setup lang="ts">
import type { Ingredient } from "~/types/recipe";
import { Field } from "vee-validate";
import { FormControl, FormItem } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "~/components/ui/input";
import { SelectLabel } from "~/components/ui/select";
import { Trash2 } from "lucide-vue-next";
import { metricUnits, imperialUnits, UnitFormatter } from "~/lib/Unit";

defineEmits(["delete"]);
defineModel<Ingredient>();
defineProps<{ name: string; as?: string }>();

const formatter = new UnitFormatter({ style: "full" });
</script>

<template>
  <Component :is="as ?? 'div'" class="col-span-5 grid grid-cols-subgrid">
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
            <SelectLabel>Metric units</SelectLabel>
            <SelectItem
              v-for="unit of metricUnits"
              :key="unit.name"
              :value="unit.name"
              >{{ formatter.formatUnit(unit.name) }}
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Imperial units</SelectLabel>
            <SelectItem
              v-for="unit of imperialUnits"
              :key="unit.name"
              :value="unit.name"
              >{{ formatter.formatUnit(unit.name) }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
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
