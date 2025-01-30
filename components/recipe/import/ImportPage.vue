<script setup lang="ts">
import { Bird, ScanSearch } from "lucide-vue-next";
import { Settings } from "~/lib/Settings";
import OpenAI from "openai";
import { head } from "lodash";
import NoModelAvailable from "~/components/recipe/import/NoModelAvailable.vue";
import ModelSelect from "~/components/recipe/import/ModelSelect.vue";
import FreeTrialsCounter from "~/components/recipe/import/FreeTrialsCounter.vue";
import ImportSourceForm from "~/components/recipe/import/ImportSourceForm.vue";
import {
  sourceSchema,
  type SourceValue,
} from "~/components/recipe/import/SourceValue";
import ExtractionResult from "~/components/recipe/import/ExtractionResult.vue";
import { useRealtimeExtraction } from "~/components/recipe/import/useRealtimeExtraction";

const client = useSupabaseClient();

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
  return apiKey.data.value;
});

const structuredOutputSupportedModels = new Set([
  "o1",
  "gpt-4o",
  "gpt-4o-mini",
]);

const models = await useAsyncData(
  async () => {
    if (apiKey.data.value) {
      const openAI = new OpenAI({
        apiKey: apiKey.data.value,
        dangerouslyAllowBrowser: true,
      });
      const modelsPage = await openAI.models.list();

      const availableIds = new Set(modelsPage.data.map((el) => el.id));

      return structuredOutputSupportedModels.intersection(availableIds);
    }
  },
  {
    watch: [apiKey.data],
    lazy: true,
    server: false,
  },
);

const currentModel = ref<string>();

watch(models.data, (models) => {
  currentModel.value = head([...(models?.values() ?? [])]);
});

const sourceValue = ref<SourceValue>({
  url: "",
  text: "",
  image: null,
  current: "url",
});

const sourceValid = computed(
  () => sourceSchema.safeParse(sourceValue.value).success,
);

const extraction = useRealtimeExtraction(currentModel, sourceValue);
</script>

<template>
  <div
    v-if="
      freeUsage.data.value === 6 &&
      extraction.status.value === 'idle' &&
      !hasApiKey
    "
    class="flex w-full max-w-xl flex-col gap-2 self-center"
  >
    <h3 class="heading-3">Oh no!</h3>
    <p class="text-sm">
      You have reached the free AI trials limit. To reduce operating costs, and
      keep Recipebase subscription-free, we ask you to provide your own OpenAI
      key. While you will have to use a credit card to create an OpenAI key, you
      will only be charged for what you use. No extra cost attached. You can
      create an API key
      <a
        target="_blank"
        href="https://platform.openai.com/api-keys"
        class="text-foreground underline underline-offset-4"
        >here</a
      >
      and then add it in the
      <NuxtLink
        to="/settings"
        class="text-foreground underline underline-offset-4"
        >Settings
      </NuxtLink>
    </p>
  </div>
  <template v-else>
    <div class="flex flex-col items-center gap-4">
      <div
        class="flex max-w-2xl flex-col gap-4 overflow-hidden border max-md:-mx-4 max-md:self-stretch md:w-full md:rounded-xl"
      >
        <div class="flex flex-col gap-5 border-b surface-1 p-6">
          <ImportSourceForm
            v-model="sourceValue"
            :disabled="extraction.status.value === 'pending'"
          />
          <div class="flex items-center gap-2">
            <FreeTrialsCounter
              v-if="!hasApiKey"
              :usage="freeUsage.data.value ?? undefined"
            />

            <div
              v-else-if="models.status.value === 'pending'"
              class="h-3 w-36 skeleton-2 rounded-full"
            ></div>

            <template v-else-if="models.status.value === 'success'">
              <ModelSelect
                v-if="models.data.value!.size > 0"
                v-model="currentModel"
                :items="models.data.value!"
                :disabled="extraction.status.value === 'pending'"
              />

              <NoModelAvailable v-else />
            </template>

            <div class="grow"></div>

            <SpinnerButton
              :loading="extraction.status.value === 'pending'"
              :disabled="
                !(
                  ((!hasApiKey && (freeUsage.data?.value ?? 0) < 6) ||
                    currentModel) &&
                  sourceValid
                )
              "
              @click="extraction.execute()"
            >
              Search for recipes
            </SpinnerButton>
          </div>
        </div>
        <div class="flex min-h-52 flex-col gap-2 self-stretch p-2 px-6">
          <template v-if="extraction.status.value === 'idle'">
            <div class="flex flex-col items-center self-center p-8">
              <ScanSearch class="size-24 stroke-muted" stroke-width="1" />
              <div class="text-sm text-muted">
                Please fill the above form to get started.
              </div>
            </div>
          </template>
          <template v-if="extraction.status.value === 'pending'">
            <div
              class="flex grow flex-col items-center justify-center gap-4 self-center"
            >
              <p class="text-base">
                {{ extraction.progress.value.name }}
              </p>
              <Progress
                :model-value="extraction.progress.value.progress * 100"
                class="h-1 w-64"
              />
              <p class="text-xs text-muted-foreground">
                This may take a few minutes
              </p>
            </div>
          </template>
          <div v-if="extraction.status.value === 'error'" class="p-6">
            <ErrorStatus />
          </div>
          <template v-if="extraction.status.value === 'success'">
            <div
              v-if="extraction.data.value?.length === 0"
              class="flex flex-col items-center gap-4 self-center p-8"
            >
              <Bird class="size-24 stroke-muted" stroke-width="1" />
              <div class="text-muted">No recipe found.</div>
            </div>
            <div v-else class="flex flex-col gap-2">
              <ExtractionResult
                v-for="(result, index) in extraction.data.value"
                :key="index"
                :result="result"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </template>
</template>
