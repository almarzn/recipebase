<template>
  <div
    class="px-5 py-3 text-sm max-md:border-b max-md:bg-gray-50/5 max-md:backdrop-blur-2xl md:px-7 md:py-5"
  >
    <div class="flex items-center justify-start gap-3 md:gap-8">
      <NuxtLink to="/" class="flex items-center justify-start gap-4">
        <img src="/icon_white.svg" class="size-6" alt="Log" />
        <div class="max-sm:hidden">Recipebase.co</div>
      </NuxtLink>

      <div class="h-9 grow" />

      <Button
        v-umami="{ name: 'Signup', source: 'Navigation' }"
        as-child
        variant="secondary"
      >
        <NuxtLink to="/login"> Sign In </NuxtLink>
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
