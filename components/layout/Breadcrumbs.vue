<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in items" :key="index">
        <BreadcrumbItem class="text-md">
          <BreadcrumbLink v-if="item.to !== undefined" :to="item.to">
            {{ item.text }}
          </BreadcrumbLink>
          <BreadcrumbPage v-else>
            {{ item.text }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < items.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import type { RouteLocationRaw } from "#vue-router";

defineProps<{
  items: { to?: RouteLocationRaw; text: string }[];
}>();
</script>
