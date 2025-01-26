<script setup lang="ts">
import { CircleHelp } from "lucide-vue-next";
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-red-500">
    No model available

    <Popover>
      <PopoverTrigger>
        <CircleHelp class="size-3" />
      </PopoverTrigger>
      <PopoverContent class="space-y-2">
        <p class="text-sm">
          There is no OpenAI model available for the current API key. This
          usually means that no payment options has been set in the OpenAI API
          console.
        </p>
      </PopoverContent>
    </Popover>
  </div>
</template>
