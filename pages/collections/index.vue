<script setup lang="ts">
import AllCollections from "~/components/collections/AllCollections.vue";
import PageLayout from "~/components/layout/PageLayout.vue";
import { Breadcrumbs } from "~/components/layout";
</script>
<template>
  <page-layout>
    <all-collections>
      <breadcrumbs
        :items="[
          {
            to: '/',
            text: 'Home',
          },
          {
            text: 'Collections',
          },
        ]"
      />
    </all-collections>
  </page-layout>
</template>
