<template>
  <div class="flex flex-col items-stretch gap-2 self-stretch backdrop-blur-3xl">
    <div class="flex flex-col gap-2 rounded-md border px-6 py-5">
      <div class="flex flex-col">
        <div class="skeleton-base w-56 skeleton-1"></div>
        <div class="text-xs text-muted-foreground">
          <div class="skeleton-xs w-full skeleton-2"></div>
          <div class="skeleton-xs w-1/4 skeleton-2"></div>
        </div>
      </div>
      <div class="flex gap-1">
        <div class="h-[22px] w-20 skeleton-3 rounded-sm"></div>
      </div>
    </div>
    <div class="flex flex-col gap-2 rounded-md border px-6 py-5">
      <div class="flex flex-col">
        <div class="skeleton-base w-80 skeleton-1"></div>
        <div class="text-xs text-muted-foreground">
          <div class="skeleton-xs w-1/3 skeleton-2"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
