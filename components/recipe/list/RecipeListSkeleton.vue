<template>
  <div class="flex flex-col items-stretch gap-2 self-stretch backdrop-blur-3xl">
    <div class="flex flex-col gap-2 rounded-md border px-6 py-5">
      <div class="flex flex-col">
        <div class="skeleton-1 skeleton-base w-56"></div>
        <div class="text-xs text-muted-foreground">
          <div class="skeleton-2 skeleton-xs w-full"></div>
          <div class="skeleton-2 skeleton-xs w-1/4"></div>
        </div>
      </div>
      <div class="flex gap-1">
        <div class="skeleton-3 h-[22px] w-20 rounded-sm"></div>
      </div>
    </div>
    <div class="flex flex-col gap-2 rounded-md border px-6 py-5">
      <div class="flex flex-col">
        <div class="skeleton-1 skeleton-base w-80"></div>
        <div class="text-xs text-muted-foreground">
          <div class="skeleton-2 skeleton-xs w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
