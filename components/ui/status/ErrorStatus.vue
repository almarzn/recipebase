<script setup lang="ts">
import { ServerCrash } from "lucide-vue-next";
</script>

<template>
  <div class="flex gap-8 items-center self-center">
    <server-crash :size="64" stroke-width="1" class="stroke-muted-foreground" />
    <div class="flex flex-col gap-3 max-w-96 items-start self-center">
      <h4 class="heading-4">An error has occurred</h4>
      <p class="text-muted-foreground">
        Unable to fetch data. Try again later.
      </p>
    </div>
  </div>
</template>
