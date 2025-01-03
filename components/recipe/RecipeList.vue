<script lang="ts" setup>
import { CirclePlus } from "lucide-vue-next";
</script>

<template>
  <div
    class="max-w-screen-xl flex flex-col gap-8 items-stretch w-full self-center"
  >
    <div class="flex justify-between flex-wrap">
      <h3 class="heading-3">Recipes</h3>
      <div class="flex gap-2">
        <Button><CirclePlus /> Create recipe</Button>
      </div>
    </div>
  </div>
</template>
