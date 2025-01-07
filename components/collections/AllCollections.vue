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
    class="max-w-screen-xl flex flex-col gap-8 items-stretch w-full self-center"
  >
    <div class="flex justify-between flex-wrap items-center">
      <slot />
      <create-collection variant="default" @create="updateData()" />
    </div>

    <div
      v-if="collections?.length === 0"
      class="flex gap-8 items-center self-center"
    >
      <book-text :size="64" class="stroke-muted-foreground" />
      <div class="flex flex-col gap-3 max-w-96 items-start self-center">
        <h4 class="heading-4">No handbook created yet</h4>
        <p class="text-muted-foreground">
          Create a new handbook to get started.
        </p>
        <create-collection variant="outline" @create="updateData()" />
      </div>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-8 items-center self-stretch">
      <collection-item
        v-for="collection in collections"
        :key="collection.id"
        :collection
        @update="updateData()"
      />
    </div>
  </div>
</template>
