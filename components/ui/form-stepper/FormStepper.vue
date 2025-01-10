<script lang="ts" setup>
import type { StepperRootEmits, StepperRootProps } from "radix-vue";
import { useForwardPropsEmits } from "radix-vue";
import { cn } from "@/lib/utils";
import { ArrowLeft, type Component } from "lucide-vue-next";

import { computed, type HTMLAttributes } from "vue";
import { StepperItem } from "~/components/ui/stepper";
import type { RouteLocationRaw } from "#vue-router";

const props = defineProps<
  StepperRootProps & {
    class?: HTMLAttributes["class"];
    steps: {
      title: string;
      description: string;
      step: number;
      icon: Component;
    }[];
    header: string;
    subHeader: string;
    backLinkTo: RouteLocationRaw;
  }
>();
const emits = defineEmits<StepperRootEmits>();

const delegatedProps = computed(() => {
  const {
    class: _,
    header: __,
    subHeader: ___,
    steps: ____,
    ...delegated
  } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <Stepper
    v-slot="slotProps"
    :class="
      cn(
        'flex max-md:flex-col gap-10 mx-auto items-start w-full p-4 max-w-screen-lg',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <div
      class="flex w-full flex-col justify-start gap-7 rounded-lg bg-cyan-800/15 px-6 pb-10 pt-4 md:max-w-xs"
    >
      <div class="flex gap-2 max-md:items-center md:flex-col">
        <NuxtLink :to="backLinkTo">
          <Button
            variant="secondary"
            class="self-start rounded-full bg-cyan-800/30 md:mb-5"
          >
            <ArrowLeft />
            Back
          </Button>
        </NuxtLink>
        <h3 class="heading-3">{{ header }}</h3>
        <p class="text-muted-foreground max-md:hidden">
          {{ subHeader }}
        </p>
      </div>

      <div class="flex flex-wrap gap-7 md:flex-col">
        <StepperItem
          v-for="step of steps"
          :key="step.step"
          v-slot="{ state }"
          :step="step.step"
          class="relative flex items-start gap-6 max-md:items-center md:w-full"
        >
          <StepperSeparator
            v-if="step.step !== steps[steps.length - 1].step"
            class="absolute left-[18px] top-[36px] block h-[105%] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-cyan-600 max-md:hidden"
          />

          <StepperTrigger as-child>
            <Button
              :variant="
                state === 'completed' || state === 'active'
                  ? 'default'
                  : 'outline'
              "
              size="icon"
              class="z-10 shrink-0 rounded-full group-data-[state=active]:bg-cyan-600 group-data-[state=completed]:bg-cyan-600"
              :class="[
                state === 'active' &&
                  'ring-2 ring-cyan-600 ring-offset-2 ring-offset-background',
              ]"
            >
              <component :is="step.icon" class="size-5" />
            </Button>
          </StepperTrigger>

          <div class="flex flex-col gap-1">
            <StepperTitle
              :class="[
                state === 'active'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground',
              ]"
              class="text-sm font-semibold transition lg:text-base"
            >
              {{ step.title }}
            </StepperTitle>
            <StepperDescription
              :class="[
                state === 'active'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground',
              ]"
              class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
            >
              {{ step.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </div>
    </div>

    <slot v-bind="slotProps" />
  </Stepper>
</template>
