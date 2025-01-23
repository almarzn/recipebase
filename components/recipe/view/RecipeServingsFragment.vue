<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "~/components/ui/number-field";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "radix-vue";
import type { RecipeServings } from "~/types/recipe";
import {
  HashIcon,
  PercentIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-vue-next";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import type { NumberFormatOptions } from "@internationalized/number";

const model = defineModel<number>();

const props = defineProps<{
  servings: RecipeServings;
}>();

const type = ref<"unit" | "percent">("unit");

const typeOptions: Record<
  "unit" | "percent",
  {
    formatOptions: NumberFormatOptions;
    value: Ref<number>;
    stepAmount: number;
  }
> = {
  percent: {
    formatOptions: {
      style: "percent",
      minimumFractionDigits: 0,
    },
    stepAmount: 0.01,
    value: computed({
      get: () => (model.value ?? 1) / (props.servings.amount ?? 1),
      set: (val) => (model.value = (val ?? 1) * (props.servings.amount ?? 1)),
    }),
  },
  unit: {
    formatOptions: {
      minimumFractionDigits: 2,
    },
    stepAmount: 0.25,
    value: computed({
      get: () => model.value ?? 0,
      set: (val) => (model.value = val),
    }),
  },
};

const currentType = () => typeOptions[type.value];
</script>

<template>
  <CollapsibleRoot
    v-slot="{ open }"
    class="group rounded-md border border-gray-700/20 px-3 py-2 data-[active=true]:border-gray-700/20 data-[active=true]:bg-gray-900"
    :data-active="modelValue !== servings.amount"
  >
    <CollapsibleTrigger class="flex w-full gap-1 text-xs">
      Servings
      <ChevronRightIcon
        v-if="!open"
        class="size-4 text-muted-foreground opacity-0 hover-hover:hover:opacity-100 hover-none:opacity-100"
      />
      <ChevronUpIcon
        v-else
        class="size-4 text-muted-foreground opacity-0 hover-hover:hover:opacity-100 hover-none:opacity-100"
      />
      <div class="grow"></div>
      <div
        v-if="!open"
        class="text-muted-foreground group-data-[active=true]:font-semibold group-data-[active=true]:text-blue-200"
      >
        {{
          currentType().value.value.toLocaleString(
            undefined,
            currentType().formatOptions,
          )
        }}
      </div>
      <ToggleGroup
        v-if="open"
        v-model="type"
        type="single"
        size="sm"
        @click.stop
      >
        <ToggleGroupItem value="unit" aria-label="Toggle unit display">
          <HashIcon class="size-3 stroke-muted-foreground" />
        </ToggleGroupItem>
        <ToggleGroupItem value="percent" aria-label="Toggle percent display">
          <PercentIcon class="size-3 stroke-muted-foreground" />
        </ToggleGroupItem>
      </ToggleGroup>
    </CollapsibleTrigger>
    <CollapsibleContent class="flex flex-col gap-2">
      <div></div>
      <NumberField
        id="number"
        v-model="currentType().value.value"
        :format-options="currentType().formatOptions"
        :step="currentType().stepAmount"
      >
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <p class="text-xs text-muted-foreground">{{ servings.notes }}</p>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
