<script setup lang="ts">
import { CircleHelp } from "lucide-vue-next";

defineProps<{
  usage: number | undefined;
}>();
</script>

<template>
  <div class="flex items-center gap-1 text-sm text-muted-foreground">
    {{ usage ?? 0 }} / 6 AI trials remaining
    <Popover>
      <PopoverTrigger>
        <CircleHelp class="size-4" />
      </PopoverTrigger>
      <PopoverContent class="space-y-2">
        <p class="text-sm">
          As much as we would like to provide all the awesome features of
          Recipebase for free, LLMs costs money.
        </p>

        <p class="text-sm">
          Once the usage limit is reached, you will have to provide in the
          settings your OpenAI key. This solution allows us to keep operating at
          lower costs, while permitting you to only ever pay for what you use.
          No subscription, no obscure costs.
        </p>
      </PopoverContent>
    </Popover>
  </div>
</template>
