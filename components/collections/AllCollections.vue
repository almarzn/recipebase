<script setup lang="ts">
import { BookText } from "lucide-vue-next";
import type { Database } from "@/types/database.types";
import CreateCollection from "~/components/collections/CreateCollection.vue";
import CollectionItem from "~/components/collections/CollectionItem.vue";

const client = useSupabaseClient<Database>();

const { data: collections } = await useAsyncData("collections", async () => {
  const { data } = await client
    .from("collections")
    .select()
    .order("created_at");

  return data;
});

const updateData = () => {
  refreshNuxtData("collections");
};
</script>

<template>
  <div
    class="flex w-full max-w-screen-xl flex-col items-stretch gap-8 self-center"
  >
    <div class="flex flex-wrap items-center justify-between">
      <slot />
      <create-collection variant="default" @create="updateData()" />
    </div>

    <div
      v-if="collections?.length === 0"
      class="flex items-center gap-8 self-center"
    >
      <book-text :size="64" class="stroke-muted-foreground" />
      <div class="flex max-w-96 flex-col items-start gap-3 self-center">
        <h4 class="heading-4">No handbook created yet</h4>
        <p class="text-muted-foreground">
          Create a new handbook to get started.
        </p>
        <create-collection variant="outline" @create="updateData()" />
      </div>
    </div>

    <div v-else class="grid items-center gap-8 self-stretch md:grid-cols-2">
      <collection-item
        v-for="collection in collections"
        :key="collection.id"
        :collection
        @update="updateData()"
      />
    </div>
  </div>
</template>
