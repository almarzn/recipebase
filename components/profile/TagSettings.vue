<script setup lang="ts">
import { Tags } from "~/lib/Tags";
import {
  TrashIcon,
  CirclePlusIcon,
  BanIcon,
  CheckIcon,
  SmilePlusIcon,
} from "lucide-vue-next";
import TagIcon from "~/components/recipe/TagIcon.vue";
import { v4 } from "uuid";
import type { TagProps } from "~/types/recipe";
import { toast } from "vue-sonner";
import {
  EditableArea,
  EditableCancelTrigger,
  EditableInput,
  EditablePreview,
  EditableRoot,
  EditableSubmitTrigger,
  PopoverClose,
} from "radix-vue";

const tagColors: TagProps["color"][] = [
  "gray",
  "zinc",
  "slate",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const tagIcons: Exclude<TagProps["icon"], null>[] = [
  "apple",
  "beef",
  "candy",
  "carrot",
  "dessert",
  "fish_symbol",
  "cup_soda",
  "vegan",
  "leafy_green",
  "wheat",
  "wheat_off",
  "egg",
  "egg_off",
];

const client = useSupabaseClient();
const { data: tags, refresh } = await useAsyncData(() =>
  Tags.using(client).findAll(),
);

const addNewTag = async () => {
  const props: TagProps = {
    id: v4(),
    text: "New tag",
    color: "gray",
    icon: null,
  };
  tags.value = [
    ...(tags.value ?? []),
    {
      ...props,
      user_id: "virtual",
    },
  ];

  try {
    await Tags.using(client).createTag(props);
  } catch (e) {
    console.log(e);

    toast.error("Unable to create tag. Please try again.");

    await refresh();
  }
};

const updateProps = async (id: string, props: Partial<TagProps>) => {
  console.log("updateProps", id, props);
  tags.value = tags.value!.map((el) =>
    el.id === id
      ? {
          ...el,
          ...props,
        }
      : el,
  );

  try {
    await Tags.using(client).updateTag(id, props);
  } catch (e) {
    console.log(e);

    toast.error("Unable to update tag. Please try again.");
  } finally {
    await refresh();
  }
};

const deleteTag = async (id: string) => {
  tags.value = tags.value!.filter((el) => el.id !== id);

  try {
    await Tags.using(client).deleteTag(id);
  } catch (e) {
    console.log(e);

    toast.error("Unable to delete tag. Please try again.");
  } finally {
    await refresh();
  }
};
</script>

<template>
  <div class="grid grid-cols-[auto_auto_1fr_auto] gap-x-4 gap-y-2 rounded-md">
    <EditableRoot
      v-for="tag in tags ?? []"
      v-slot="{ isEditing }"
      :key="tag.id"
      class="group/tag-row col-span-4 grid grid-cols-subgrid items-center rounded-md border bg-gray-950 py-1 pr-2 pl-3 data-[rights=readonly]:pointer-events-none data-[rights=readonly]:opacity-50"
      :data-rights="tag.user_id === null ? 'readonly' : 'editable'"
      :default-value="tag.text"
      submit-mode="both"
      @submit="(text) => updateProps(tag.id, { text })"
    >
      <Popover>
        <PopoverTrigger as-child>
          <Tag
            :color="tag.color"
            class="size-5 appearance-none rounded-full border p-0"
            as="button"
          />
        </PopoverTrigger>
        <PopoverContent class="flex flex-col gap-4">
          <div class="text-xs text-muted-foreground">
            Pick a color for {{ tag.text }}
          </div>
          <fieldset class="flex flex-wrap gap-2">
            <Tag
              v-for="color in tagColors"
              :key="color"
              :color="color"
              class="relative size-5 items-center justify-center overflow-hidden rounded-full border p-0"
            >
              <PopoverClose>
                <input
                  type="radio"
                  name="color"
                  class="peer absolute inset-0 cursor-pointer appearance-none"
                  :checked="tag.color === color"
                  @click="() => updateProps(tag.id, { color })"
                />
                <CheckIcon class="hidden size-3 peer-checked:block" />
              </PopoverClose>
            </Tag>
          </fieldset>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <TagIcon
            v-if="tag.icon"
            :tag
            class="size-4 stroke-muted-foreground"
          />
          <SmilePlusIcon
            v-else
            class="size-4 stroke-muted-foreground hover-hover:opacity-0 hover-hover:group-hover/tag-row:opacity-100"
          />
        </PopoverTrigger>
        <PopoverContent class="flex flex-col gap-4">
          <div class="text-xs text-muted-foreground">
            Pick an icon for {{ tag.text }}
          </div>
          <fieldset class="flex flex-wrap gap-2">
            <div
              v-for="icon in tagIcons"
              :key="icon"
              class="relative flex size-6 items-center justify-center overflow-hidden rounded-sm border p-0.5 has-[:checked]:border-white has-[:checked]:bg-gray-900"
            >
              <PopoverClose as-child>
                <input
                  type="radio"
                  name="icon"
                  class="peer absolute inset-0 cursor-pointer appearance-none"
                  :checked="tag.icon === icon"
                  @click="() => updateProps(tag.id, { icon })"
                />
              </PopoverClose>
              <TagIcon :tag="{ icon }" class="size-4" />
            </div>
          </fieldset>
        </PopoverContent>
      </Popover>

      <div
        class="flex items-center gap-1 text-sm data-[editing=true]:col-span-2"
        :data-editing="isEditing"
      >
        <EditableArea class="flex h-9 grow items-center">
          <EditablePreview class="grow" />
          <EditableInput class="w-full grow bg-transparent outline-none" />
        </EditableArea>
        <EditableCancelTrigger v-if="isEditing" as-child>
          <Button class="h-auto p-1 text-xs" variant="ghost">
            <BanIcon />
          </Button>
        </EditableCancelTrigger>
        <EditableSubmitTrigger v-if="isEditing" as-child>
          <Button class="h-auto p-1 text-xs">Save</Button>
        </EditableSubmitTrigger>
      </div>

      <Button
        v-if="!isEditing && tag.user_id !== null"
        variant="ghost"
        class="h-auto p-2"
        @click="deleteTag(tag.id)"
      >
        <TrashIcon class="size-4" />
      </Button>
    </EditableRoot>

    <Button variant="secondary" class="col-span-4" @click="addNewTag">
      <CirclePlusIcon />

      Add a new tag
    </Button>
  </div>
</template>
