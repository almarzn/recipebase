<script setup lang="ts"></script>

<template>
  <div class="flex grow gap-4 max-md:flex-col md:gap-6 lg:gap-12 2xl:gap-14">
    <div class="flex min-w-56 basis-56 flex-col gap-6">
      <h3 class="skeleton-h3 skeleton-1 skeleton-lg w-28">Ingredients</h3>

      <ul class="flex flex-col gap-2">
        <li class="pb-1">
          <div class="skeleton-1 skeleton-base w-20" />
        </li>
        <li class="pb-1">
          <div class="skeleton-1 skeleton-base w-24" />
        </li>
        <li class="pb-1">
          <div class="skeleton-1 skeleton-base w-16" />
        </li>
      </ul>
    </div>

    <div
      class="flex grow flex-col gap-6 rounded-xl border p-5 shadow-md backdrop-blur-3xl"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1">
            <div class="skeleton-3 h-[22px] w-20 rounded-sm"></div>
          </div>
          <h2 class="skeleton-1 skeleton-h2 w-60"></h2>
        </div>
        <p class="flex flex-wrap gap-1 text-muted-foreground">
          <span class="skeleton-2 skeleton-base w-12"></span>
          <span class="skeleton-3 skeleton-base w-24"></span>
          <span class="skeleton-3 skeleton-base w-8"></span>
          <span class="skeleton-2 skeleton-base w-24"></span>
          <span class="skeleton-2 skeleton-base w-8"></span>
          <span class="skeleton-3 skeleton-base w-12"></span>
          <span class="skeleton-2 skeleton-base w-8"></span>
          <span class="skeleton-3 skeleton-base w-2"></span>
          <span class="skeleton-2 skeleton-base w-12"></span>
          <span class="skeleton-3 skeleton-base w-12"></span>
          <span class="skeleton-3 skeleton-base w-20"></span>
          <span class="skeleton-2 skeleton-base w-8"></span>
          <span class="skeleton-2 skeleton-base w-12"></span>
          <span class="skeleton-3 skeleton-base w-24"></span>
          <span class="skeleton-2 skeleton-base w-8"></span>
          <span class="skeleton-2 skeleton-base w-24"></span>
          <span class="skeleton-3 skeleton-base w-12"></span>
          <span class="skeleton-2 skeleton-base w-20"></span>
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <div class="skeleton-1 skeleton-h3 self-start">Steps</div>
        <div>
          <div class="h-10">
            <div class="skeleton-2 skeleton-base w-72"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-3 skeleton-base w-64"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-2 skeleton-base w-80"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-1 skeleton-base w-72"></div>
          </div>
          <div class="h-10">
            <div class="skeleton-2 skeleton-base w-96"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="min-w-56 basis-56 max-lg:hidden"></div>
  </div>
</template>
