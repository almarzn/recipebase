<script setup lang="ts">
import { FormControl } from "~/components/ui/form";
import { imperialUnits, metricUnits, UnitFormatter } from "~/lib/Unit";
import { ChevronsUpDown, Check } from "lucide-vue-next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ingredientUnitSchema } from "~/types/recipe";
import { SpinnerButton } from "~/components/ui/button";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const model = defineModel<string>();

const parsedValue = computed(
  () => ingredientUnitSchema.safeParse(model.value).data ?? undefined,
);
const open = ref(false);

const update = (value: string) => {
  model.value = value;
  open.value = false;
};

const breakpoints = useBreakpoints(breakpointsTailwind);

const formatter = computed(
  () =>
    new UnitFormatter({
      style: breakpoints.smallerOrEqual("lg") ? "short" : "full-inverted",
    }),
);
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <FormControl>
        <Button
          variant="outline"
          :classes="{
            base: 'place-content-stretch',
            content: 'justify-between',
          }"
        >
          <div class="overflow-hidden text-ellipsis text-start lg:w-20">
            {{
              parsedValue
                ? formatter.formatUnit(parsedValue)
                : "Please select..."
            }}
          </div>
          <ChevronsUpDown />
        </Button>
      </FormControl>
    </PopoverTrigger>
    <PopoverContent class="p-0">
      <Command>
        <CommandInput placeholder="Search units" />
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandList>
          <CommandGroup heading="Metric units">
            <CommandItem
              v-for="unit of metricUnits"
              :key="unit.name"
              :value="unit.name"
              class="flex items-center justify-between"
              @select="update(unit.name)"
            >
              {{ formatter.formatUnit(unit.name) }}

              <Check
                class="size-4 opacity-0 data-[active=true]:opacity-100"
                :data-active="unit.name === modelValue"
              />
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Imperial units">
            <CommandItem
              v-for="unit of imperialUnits"
              :key="unit.name"
              :value="unit.name"
              class="flex items-center justify-between"
              @select="update(unit.name)"
            >
              {{ formatter.formatUnit(unit.name) }}

              <Check
                class="size-4 opacity-0 data-[active=true]:opacity-100"
                :data-active="unit.name === modelValue"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
