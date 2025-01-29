<template>
  <div
    class="grid grid-cols-1 items-center justify-evenly gap-6 p-10 md:grid-cols-3 md:gap-12"
  >
    <div class="flex items-center gap-6">
      <MonitorSmartphone class="size-7 shrink-0" :stroke-width="1" />
      <div class="flex flex-col gap-1">
        <strong>Works on every device</strong>
        <p class="text-xs text-muted-foreground">
          The application has been designed to deliver the best experience
          possible both on your laptop and your phone.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <MessageCircleHeart class="size-7 shrink-0" :stroke-width="1" />
      <div class="flex flex-col gap-1">
        <strong>Write down your experiments</strong>
        <p class="text-xs text-muted-foreground">
          You can drop-in comments on any step of the recipe. What works, what
          doesn't, or tips you found along the way.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <MegaphoneOff class="size-7 shrink-0" :stroke-width="1" />
      <div class="flex flex-col gap-1">
        <strong>No ads</strong>
        <p class="text-xs text-muted-foreground">
          Because ads get in the way of your culinary art, we kept the interface
          ad-free. In fact, we strive to keep this app nonsense-free.
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  MonitorSmartphone,
  MessageCircleHeart,
  MegaphoneOff,
} from "lucide-vue-next";
</script>
