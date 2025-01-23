<script setup lang="ts">
import PageLayout from "~/components/layout/PageLayout.vue";
import { AdaptiveBreadcrumbs } from "~/components/layout";
import SettingsPage from "~/components/profile/SettingsPage.vue";
</script>

<template>
  <PageLayout>
    <AdaptiveBreadcrumbs
      :items="[{ to: '/', text: 'Home' }, { text: 'Settings' }]"
    />

    <SettingsPage />
  </PageLayout>
</template>
