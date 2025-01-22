<script setup lang="ts">
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, ScanSearch, Bird, CircleHelp } from "lucide-vue-next";
import { z } from "zod";
import type { RecipePayload } from "~/types/recipe";
import { Checkbox } from "~/components/ui/checkbox";
import { slugify } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import { Recipes } from "~/lib/Recipes";
import { toast } from "vue-sonner";
import { Settings } from "~/lib/Settings";
import { SpinnerButton } from "~/components/ui/button";

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
  } finally {
    await freeUsage.refresh();
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

const freeUsage = await useAsyncData(async () => {
  const result = await client
    .from("free_ai_trials")
    .select()
    .maybeSingle()
    .throwOnError();

  return result.data?.usage;
});

const apiKey = await useAsyncData(async () =>
  Settings.using(client).getOpenAiKey(),
);

const hasApiKey = computed(() => {
  console.log(apiKey.data.value);
  return apiKey.data.value;
});
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
      <template
        v-if="
          freeUsage.data.value === 6 && results.status === 'idle' && !hasApiKey
        "
      >
        <h4 class="heading-4">Oh no!</h4>
        <p class="text-sm text-muted-foreground">
          You have reached the free AI trials limit. To reduce operating costs,
          and keep Recipebase subscription-free, we ask you to provide your own
          OpenAI key. While you will have to use a credit card to create an
          OpenAI key, you will only be charged for what you use. No extra cost
          attached. You can create an API key
          <a
            target="_blank"
            href="https://platform.openai.com/api-keys"
            class="text-foreground underline underline-offset-2"
            >here</a
          >
          and then add it in the settings.
        </p>
      </template>
      <template v-else>
        <div class="flex flex-col gap-1">
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
            v-if="!hasApiKey"
            class="flex items-center gap-1 text-xs text-muted-foreground"
          >
            {{ freeUsage.data ?? 0 }} / 6 AI trials remaining
            <Popover>
              <PopoverTrigger>
                <CircleHelp class="size-3" />
              </PopoverTrigger>
              <PopoverContent class="space-y-2">
                <p class="text-sm">
                  As much as we would like to provide all the awesome features
                  of Recipebase for free, LLMs costs money.
                </p>

                <p class="text-sm">
                  Once the usage limit is reached, you will have to provide in
                  the settings your OpenAI key. This solution allows us to keep
                  operating at lower costs, while permitting you to only ever
                  pay for what you use. No subscription, no obscure costs.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div
          class="flex min-h-52 flex-col gap-2 self-stretch rounded-md border p-2"
        >
          <template v-if="results?.status === 'idle'">
            <div class="flex flex-col items-center self-center p-8">
              <ScanSearch class="size-24 stroke-muted" stroke-width="1" />
              <div class="text-muted">Enter an URL to get started.</div>
            </div>
          </template>
          <template v-if="results?.status === 'pending'">
            <div class="flex flex-col items-center gap-4 self-center p-8">
              <ScanSearch class="size-24 stroke-muted" stroke-width="1" />
              <Progress indeterminate class="h-1" />
            </div>
          </template>
          <template v-if="results?.status === 'error'">
            <ErrorStatus />
          </template>
          <template
            v-if="results?.status === 'success' && results.recipes.length === 0"
          >
            <div class="flex flex-col items-center gap-4 self-center p-8">
              <Bird class="size-24 stroke-muted" stroke-width="1" />
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
              <div class="flex flex-col items-start gap-1 px-4 py-2">
                <div class="leading-none">{{ result.name }}</div>
                <div
                  class="max-h-8 overflow-hidden text-ellipsis text-xs text-muted-foreground"
                >
                  {{ result.description ?? "No description provided" }}
                </div>
              </div>
            </Checkbox>
          </template>
        </div>
      </template>
      <DialogFooter>
        <SpinnerButton
          :disabled="
            !(results.status === 'success' && (selection?.length ?? 0) > 0)
          "
          :loading="submitting"
          @click="createRecipes()"
          >Import {{ selection?.length }} recipes
        </SpinnerButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
