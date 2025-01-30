<script setup lang="ts"></script>

<template>
  <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
    <div class="flex min-w-56 basis-56 flex-col gap-6 max-md:hidden">
      <h3 class="skeleton-h3 skeleton-lg w-28 skeleton-1">Ingredients</h3>

      <ul class="flex flex-col gap-2">
        <li class="pb-1">
          <div class="skeleton-base w-20 skeleton-1" />
        </li>
        <li class="pb-1">
          <div class="skeleton-base w-24 skeleton-1" />
        </li>
        <li class="pb-1">
          <div class="skeleton-base w-16 skeleton-1" />
        </li>
      </ul>
    </div>

    <div
      class="flex grow flex-col gap-6 md:rounded-xl md:border md:p-5 md:shadow-md md:backdrop-blur-3xl"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1">
            <div class="h-[22px] w-20 skeleton-3 rounded-sm"></div>
          </div>
          <h2 class="skeleton-h2 w-60 skeleton-1"></h2>
        </div>
        <p class="flex flex-wrap gap-1 text-muted-foreground">
          <span class="skeleton-base w-12 skeleton-2"></span>
          <span class="skeleton-base w-24 skeleton-3"></span>
          <span class="skeleton-base w-8 skeleton-3"></span>
          <span class="skeleton-base w-24 skeleton-2"></span>
          <span class="skeleton-base w-8 skeleton-2"></span>
          <span class="skeleton-base w-12 skeleton-3"></span>
          <span class="skeleton-base w-8 skeleton-2"></span>
          <span class="skeleton-base w-2 skeleton-3"></span>
          <span class="skeleton-base w-12 skeleton-2"></span>
          <span class="skeleton-base w-12 skeleton-3"></span>
          <span class="skeleton-base w-20 skeleton-3"></span>
          <span class="skeleton-base w-8 skeleton-2"></span>
          <span class="skeleton-base w-12 skeleton-2"></span>
          <span class="skeleton-base w-24 skeleton-3"></span>
          <span class="skeleton-base w-8 skeleton-2"></span>
          <span class="skeleton-base w-24 skeleton-2"></span>
          <span class="skeleton-base w-12 skeleton-3"></span>
          <span class="skeleton-base w-20 skeleton-2"></span>
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <div class="skeleton-h3 skeleton-1 self-start">Steps</div>
        <div>
          <div class="h-10">
            <div class="skeleton-base w-72 skeleton-2"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-base w-64 skeleton-3"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-base w-80 skeleton-2"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-base w-72 skeleton-1"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-base w-96 skeleton-2"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="min-w-56 basis-56 max-lg:hidden"></div>
  </div>
</template>
