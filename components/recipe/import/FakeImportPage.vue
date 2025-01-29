<script setup lang="ts">
import ImportSourceForm from "~/components/recipe/import/ImportSourceForm.vue";
import ModelSelect from "~/components/recipe/import/ModelSelect.vue";
import ExtractionResult from "~/components/recipe/import/ExtractionResult.vue";
import exampleRecile from "~/components/homepage/product/exampleRecipe";
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="flex max-w-2xl flex-col gap-4 overflow-hidden border max-md:-mx-4 max-md:self-stretch md:w-full md:rounded-xl"
    >
      <div class="surface-1 flex flex-col gap-5 border-b p-6">
        <ImportSourceForm
          :model-value="{
            current: 'url',
            url: 'https://bestchefrecipes.com/delicous-recipe',
          }"
          :disabled="false"
        />
        <div class="flex items-center gap-2">
          <ModelSelect
            model-value="chatgpt-4o"
            :items="new Set(['chatgpt-4o'])"
            :disabled="false"
          />

          <div class="grow"></div>

          <Button>Search for recipes</Button>
        </div>
      </div>
      <div class="flex min-h-52 flex-col gap-2 self-stretch p-2 px-6">
        <div class="flex flex-col gap-2">
          <ExtractionResult :result="exampleRecile" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
