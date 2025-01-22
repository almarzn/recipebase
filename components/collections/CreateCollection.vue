<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { type ButtonVariants, SpinnerButton } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

const emit = defineEmits(["create"]);

const { variant } = defineProps<{
  variant: ButtonVariants["variant"];
}>();

const newBookProps = reactive({
  name: "",
});

const loading = ref(false);
const open = ref(false);

const submit = async () => {
  loading.value = true;

  await $fetch("/api/books", {
    method: "POST",
    body: newBookProps,
  });

  emit("create");

  loading.value = false;
  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button :variant="variant">
        <Plus />
        Create a collection
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new collection</DialogTitle>
        <DialogDescription>
          Click create to submit a new collection.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col items-start gap-2">
        <Label for="name" class="text-right text-sm">Collection name</Label>
        <Input
          id="name"
          v-model="newBookProps.name"
          placeholder="Top 10 best sourdough recipes"
        />
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SpinnerButton
          type="submit"
          :disabled="newBookProps.name.trim() === ''"
          :loading="loading"
          @click="submit()"
        >
          Create
        </SpinnerButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
