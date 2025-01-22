<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "vue-sonner";
import { SpinnerButton } from "~/components/ui/button";

const open = defineModel<boolean>();
const props = defineProps<{ id: string }>();
const loading = ref<boolean>(false);

const emit = defineEmits(["delete"]);

const deleteBook = async () => {
  loading.value = true;
  try {
    await $fetch(`/api/books/${props.id}`, { method: "DELETE" });
  } catch {
    loading.value = false;

    toast.error("Cannot delete handbook");
  }

  emit("delete");

  open.value = false;

  toast.success("Handbook deleted!");
};
</script>
<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Are you sure you want to delete this handbook?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the
          handbook and its associated recipes.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel> Cancel </AlertDialogCancel>
        <SpinnerButton :loading @click="deleteBook()">Delete</SpinnerButton>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
