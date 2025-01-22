<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import Sheet from "~/components/ui/sheet/Sheet.vue";
import SheetTrigger from "~/components/ui/sheet/SheetTrigger.vue";
import SheetContent from "~/components/ui/sheet/SheetContent.vue";
import SheetTitle from "~/components/ui/sheet/SheetTitle.vue";
import SheetHeader from "~/components/ui/sheet/SheetHeader.vue";
import type { LucideIcon } from "lucide-vue-next";
import { cn } from "~/lib/utils";

const breakpoints = useBreakpoints(breakpointsTailwind);

defineProps<{
  sheetTitle: string;
  icon: LucideIcon;
  class?: string;
}>();
</script>

<template>
  <Sheet v-if="breakpoints.smallerOrEqual('md').value">
    <SheetTrigger as-child>
      <div class="fixed bottom-4 right-4 z-50">
        <Button
          class="h-auto rounded-full border p-3 shadow-lg"
          variant="secondary"
        >
          <Component :is="icon" class="!size-5" />
        </Button>
      </div>
    </SheetTrigger>
    <SheetContent side="bottom" class="max-h-[90vh]">
      <SheetHeader>
        <SheetTitle>{{ sheetTitle }}</SheetTitle>
      </SheetHeader>

      <div :class="cn($props.class, 'overflow-scroll')">
        <slot />
      </div>
    </SheetContent>
  </Sheet>
  <div v-else :class="$props.class">
    <slot />
  </div>
</template>
