<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-vue-next";
import DeleteHandbook from "~/components/collections/DeleteCollection.vue";

defineEmits(["update"]);
defineProps<{ collection: { name: string; id: string; slug: string } }>();

const open = ref(false);
</script>

<template>
  <Card
    class="flex flex-row items-center justify-between bg-black/15 backdrop-blur-xl"
  >
    <DeleteHandbook
      :id="collection.id"
      v-model:open="open"
      @delete="$emit('update')"
    />
    <CardHeader>
      <CardTitle>{{ collection.name }}</CardTitle>
      <CardDescription>0 recipe</CardDescription>
    </CardHeader>
    <CardFooter class="flex gap-3 p-0 pr-6">
      <NuxtLink :to="`/collections/${collection.slug}`">
        <Button variant="secondary">Recipes</Button>
      </NuxtLink>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="w-0">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" @click="open = true">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardFooter>
  </Card>
</template>
