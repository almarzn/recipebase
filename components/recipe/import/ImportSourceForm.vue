<script lang="ts" setup>
import { useDropZone, useVModel } from "@vueuse/core";
import type { SourceValue } from "~/components/recipe/import/SourceValue";
import { showOpenFilePicker } from "show-open-file-picker";
import { head } from "lodash-es";
import { FileImage } from "lucide-vue-next";

const props = defineProps<{
  modelValue: SourceValue;
  disabled: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [SourceValue];
}>();

const model = useVModel(props, "modelValue", emit, {
  deep: true,
});

declare global {
  interface Window {
    showOpenFilePicker?: typeof showOpenFilePicker;
  }
}

const pickImage = async () => {
  const file = await (window.showOpenFilePicker ?? showOpenFilePicker)({
    types: [
      {
        description: "Images",
        accept: {
          "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  });

  model.value.image = (await head(file)?.getFile()) ?? null;
};

const ref = useTemplateRef("drop-zone");

const { isOverDropZone } = useDropZone(ref, {
  onDrop(files) {
    model.value.image = head(files) ?? null;
  },
  dataTypes: ["image/jpeg"],
  multiple: false,
  preventDefaultForUnhandled: false,
});
</script>

<template>
  <Tabs
    v-model="model.current"
    default-value="website"
    class="flex flex-col items-stretch gap-4"
  >
    <TabsList class="self-center">
      <TabsTrigger value="url" :disabled>From website</TabsTrigger>
      <TabsTrigger value="text" :disabled>From text</TabsTrigger>
      <TabsTrigger value="image" :disabled>From image</TabsTrigger>
    </TabsList>
    <TabsContent value="url">
      <div class="flex flex-col gap-3">
        <Label>Page URL</Label>
        <Input v-model="model.url" name="page-url" class="grow" :disabled />
        <p class="text-sm text-muted-foreground">
          Please note that pages that have too much content might have issues.
          In those case, please use the text import.
        </p>
      </div>
    </TabsContent>
    <TabsContent value="text">
      <div class="flex flex-col items-stretch gap-3">
        <Label>Content</Label>
        <Textarea
          v-model="model.text"
          name="text"
          class="grow"
          rows="4"
          :disabled
        />
      </div>
    </TabsContent>
    <TabsContent value="image">
      <div class="flex flex-col gap-3">
        <button
          ref="drop-zone"
          class="flex appearance-none items-center justify-center gap-2 rounded-md bg-gray-900 py-12 text-muted-foreground data-[hover-dropzone=true]:bg-gray-800"
          :disabled
          :data-hover-dropzone="isOverDropZone"
          @click="pickImage"
        >
          <template v-if="model.image">
            <FileImage /> {{ model.image.name }}
          </template>
          <template v-else>
            <div class="hidden hover-hover:block">
              Drop an image here or click here
            </div>
            <div class="hidden hover-none:block">
              Touch here to select an image
            </div>
          </template>
        </button>
      </div>
    </TabsContent>
  </Tabs>
</template>
