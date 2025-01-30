<template>
  <div class="mt-8 flex flex-col items-center border-t surface-1 p-6">
    <div
      class="relative flex w-full max-w-screen-md items-center justify-center gap-8"
    >
      <div class="text-xs">Recipebase.co</div>

      <div class="flex gap-6 text-xs text-muted-foreground">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        <NuxtLink to="https://github.com/almarzn/recipebase" target="_blank"
          >Github</NuxtLink
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
