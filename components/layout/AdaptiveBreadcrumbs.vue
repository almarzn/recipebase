<template>
  <template v-if="breakpoints.greaterOrEqual('md').value">
    <Breadcrumb>
      <BreadcrumbList>
        <template v-for="(item, index) in items" :key="index">
          <BreadcrumbItem class="text-base">
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
  <div v-else class="flex items-center gap-2">
    <Button class="p-2" variant="ghost" @click="router.back()">
      <ArrowLeft />
    </Button>

    <div>
      {{ currentPageText }}
    </div>
  </div>
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
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ArrowLeft } from "lucide-vue-next";
import { last } from "lodash";

const props = defineProps<{
  items: { to?: RouteLocationRaw; text: string }[];
}>();

const breakpoints = useBreakpoints(breakpointsTailwind);

const router = useRouter();
const currentPageText = computed(() => last(props.items)?.text);

useHead({
  title: computed(() => currentPageText.value ?? ""),
});
</script>
