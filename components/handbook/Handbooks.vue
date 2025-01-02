<script setup lang="ts">
import { BookText } from "lucide-vue-next";
import type { Database } from "@/types/database.types";
import CreateHandbook from "~/components/handbook/CreateHandbook.vue";

const client = useSupabaseClient<Database>();

const { data: books } = await useAsyncData("books", async () => {
  const { data } = await client.from("books").select().order("created_at");

  return data;
});

const updateData = () => {
  refreshNuxtData("books");
};
</script>

<template>
  <div
    class="max-w-screen-xl flex flex-col gap-8 items-stretch w-full self-center"
  >
    <div class="flex justify-between flex-wrap">
      <h3 class="heading-3">Handbooks</h3>
      <CreateHandbook variant="default" @create="updateData()" />
    </div>

    <div v-if="books?.length === 0" class="flex gap-8 items-center self-center">
      <BookText :size="64" class="stroke-muted-foreground" />
      <div class="flex flex-col gap-3 max-w-96 items-start self-center">
        <h4 class="heading-4">No handbook created yet</h4>
        <p class="text-muted-foreground">
          Create a new handbook to get started.
        </p>
        <CreateHandbook variant="outline" @create="updateData()" />
      </div>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-8 items-center self-stretch">
      <HandbookItem
        v-for="book in books"
        :key="book.id"
        :book
        @update="updateData()"
      />
    </div>
  </div>
</template>
