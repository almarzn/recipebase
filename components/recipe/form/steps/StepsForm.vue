<script setup lang="ts">
import Vuedraggable from "vuedraggable";
import { FieldArray } from "vee-validate";
import StepRow from "~/components/recipe/form/steps/StepRow.vue";
import { PlusCircle } from "lucide-vue-next";
import { v4 } from "uuid";

const newStep = () => {
  return {
    id: v4(),
  };
};
</script>

<template>
  <FieldArray v-slot="{ fields, push, remove, move }" name="steps">
    <Label>Recipe steps</Label>
    <div
      class="flex flex-col gap-2 rounded-md border bg-card/10 text-card-foreground backdrop-blur"
    >
      <div
        v-if="fields.length === 0"
        class="flex min-h-64 grow flex-col items-center justify-center gap-2"
      >
        <div
          class="max-w-44 text-center text-base font-semibold text-muted-foreground"
        >
          No step added yet
        </div>
        <div class="max-w-44 text-center text-xs text-muted-foreground">
          Add a new step for the recipe:
        </div>
        <div class="h-1"></div>
        <div class="max-w-44 text-center text-xs text-muted-foreground">
          <Button variant="outline" @click.prevent="push(newStep())">
            <PlusCircle />
            Add a step
          </Button>
        </div>
      </div>
      <Vuedraggable
        v-else
        :list="fields"
        handle=".handle"
        item-key="id"
        class="max-h-container grid min-h-64 grid-cols-[auto_1fr_auto_20px_auto] place-items-center content-start gap-2 overflow-scroll p-4"
        :animation="300"
        ghost-class="opacity-50"
        drag-class="bg-[#060715]"
        @change="move($event.moved.oldIndex, $event.moved.newIndex)"
      >
        <template #item="{ index }">
          <div class="col-span-5 grid grid-cols-subgrid">
            <StepRow :name="`steps[${index}]`" @delete="remove(index)" />
          </div>
        </template>
        <template #footer>
          <div class="col-start-2 place-self-stretch">
            <Button
              variant="secondary"
              class="w-full"
              @click.prevent="push(newStep())"
            >
              <PlusCircle />
              Add a step
            </Button>
          </div>
        </template>
      </Vuedraggable>
    </div>
  </FieldArray>
</template>
