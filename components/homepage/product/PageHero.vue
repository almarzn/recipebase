<template>
  <div class="flex w-full max-w-xl flex-col gap-8 self-center py-16">
    <div class="flex flex-col gap-6 px-4">
      <h1
        class="bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-center text-[36px] leading-tight font-extrabold text-transparent md:text-[48px] lg:text-[60px]"
      >
        All the recipes you love, in one place.
      </h1>

      <p class="text-center text-muted-foreground md:text-lg">
        Effortlessly gather all your tried-and-true recipes—from any website or
        your favorite books—into one sleek, clutter-free cookbook. Built for
        seasoned chefs and homecooks.
      </p>
    </div>

    <Button class="h-auto self-center rounded-full px-5 py-2 text-lg" as-child>
      <NuxtLink v-umami="{ name: 'Signup', source: 'Hero' }" to="/login">
        Get started
      </NuxtLink>
    </Button>
  </div>
</template>
