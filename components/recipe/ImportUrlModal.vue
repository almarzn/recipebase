<script setup lang="ts">
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, ScanSearch, Bird } from "lucide-vue-next";
import { z } from "zod";
import type { RecipePayload } from "~/types/recipe";
import { Checkbox } from "~/components/ui/checkbox";
import { slugify } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import { Recipes } from "~/lib/Recipes";
import { toast } from "vue-sonner";

const urlSchema = z.string().url("Must enter a valid URL");
const open = defineModel<boolean>();
const emits = defineEmits(["create"]);
const client = useSupabaseClient();
const url = ref<string>();
const results = ref<
  | { status: "success"; recipes: RecipePayload[] }
  | { status: "error" }
  | { status: "idle" }
  | { status: "pending" }
>({
  status: "idle",
});
const selection = ref<string[]>();
const submitting = ref<boolean>();

const loadResults = async () => {
  try {
    results.value = { status: "pending" };
    const { recipes } = await $fetch<{ recipes: RecipePayload[] }>(
      "/api/imports",
      {
        method: "POST",
        body: {
          url: url.value,
        },
      },
    );

    results.value = { status: "success", recipes };

    selection.value = recipes.map((el) => slugify(el.name));
  } catch {
    results.value = { status: "error" };
  }
};

const change = (slug: string, value: boolean) => {
  if (value) {
    selection.value = selection.value?.concat(slug);
  } else {
    selection.value = selection.value?.filter((it) => it !== slug);
  }
};

const createRecipes = async () => {
  if (
    !selection.value ||
    results.value.status !== "success" ||
    submitting.value
  ) {
    throw new Error();
  }

  submitting.value = true;

  try {
    for (const recipe of results.value.recipes.filter((el) =>
      selection.value?.includes(slugify(el.name)),
    )) {
      await Recipes.using(client).create(recipe);
    }
    open.value = false;
    toast.success("Imported recipe(s) to recipebase");
    emits("create");
  } catch (e: unknown) {
    toast.error("An error occurred while importing recipe", {
      description: String(e),
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Import recipes from another website</DialogTitle>
        <DialogDescription>
          Paste an URL to fetch a recipe from any website.
        </DialogDescription>
      </DialogHeader>
      <div class="flex gap-2">
        <Input v-model="url" name="page-url" class="grow" />
        <Button
          variant="secondary"
          :disabled="!urlSchema.safeParse(url).success"
          @click="loadResults()"
        >
          <ArrowRight />
        </Button>
      </div>
      <div
        class="flex gap-2 flex-col self-stretch border min-h-52 rounded-md p-2"
      >
        <template v-if="results?.status === 'idle'">
          <div class="self-center flex items-center flex-col p-8">
            <ScanSearch class="stroke-muted size-24" stroke-width="1" />
            <div class="text-muted">Enter an URL to get started.</div>
          </div>
        </template>
        <template v-if="results?.status === 'pending'">
          <div class="self-center flex items-center flex-col p-8 gap-4">
            <ScanSearch class="stroke-muted size-24" stroke-width="1" />
            <Progress indeterminate class="h-1" />
          </div>
        </template>
        <template v-if="results?.status === 'error'">
          <ErrorStatus />
        </template>
        <template
          v-if="results?.status === 'success' && results.recipes.length === 0"
        >
          <div class="self-center flex items-center flex-col p-8 gap-4">
            <Bird class="stroke-muted size-24" stroke-width="1" />
            <div class="text-muted">No recipe found.</div>
          </div>
        </template>
        <template v-if="results?.status === 'success'">
          <Checkbox
            v-for="result in results!.recipes"
            :key="result.name"
            :name="slugify(result.name)"
            :checked="selection?.includes(slugify(result.name))"
            @update:checked="change(slugify(result.name), $event)"
          >
            <div class="flex flex-col gap-1 items-start py-2 px-4">
              <div class="leading-none">{{ result.name }}</div>
              <div
                class="text-muted-foreground text-xs max-h-8 overflow-hidden overflow-ellipsis"
              >
                {{ result.description ?? "No description provided" }}
              </div>
            </div>
          </Checkbox>
        </template>
      </div>
      <DialogFooter>
        <Button
          :disabled="
            !(results.status === 'success' && (selection?.length ?? 0) > 0)
          "
          :loading="submitting"
          @click="createRecipes()"
          >Import {{ selection?.length }} recipes</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
