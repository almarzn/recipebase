<script setup lang="ts">
import { Plus, Eye } from "lucide-vue-next";
import type { RecipePayload } from "~/types/recipe";
import { Recipes } from "~/lib/Recipes";
import { toast } from "vue-sonner";

const props = defineProps<{
  result: RecipePayload;
}>();
const client = useSupabaseClient();

const importResult = await useAsyncData(
  async () => {
    try {
      return await Recipes.using(client).create(props.result);
    } catch (e) {
      toast.error(`Unable to add recipe '${props.result.name}'`);
      throw e;
    }
  },
  {
    immediate: false,
  },
);
</script>

<template>
  <div class="flex items-center gap-3 rounded-s border px-4 py-3">
    <div class="flex grow flex-col items-start gap-2">
      <div>
        <h4>{{ result.name }}</h4>
        <p class="text-xs text-muted-foreground">
          {{ result.description }}
        </p>
      </div>
      <div class="flex gap-2 text-xs text-muted-foreground">
        <div class="flex h-5 items-center gap-1 rounded-sm border">
          <div class="self-stretch rounded-l-sm border-r px-2">servings</div>
          <div class="pr-1">
            {{ result.servings?.amount ?? "unknown" }}
          </div>
        </div>
        <div class="flex h-5 items-center gap-1 rounded-sm border">
          <div class="self-stretch rounded-l-sm border-r px-2">steps</div>
          <div class="pr-1">
            {{ result.steps.length }}
          </div>
        </div>
        <div class="flex h-5 items-center gap-1 rounded-sm border">
          <div class="self-stretch rounded-l-sm border-r px-2">ingredients</div>
          <div class="pr-1">
            {{ result.ingredients.length }}
          </div>
        </div>
      </div>
    </div>
    <SpinnerButton
      v-if="importResult.status.value !== 'success'"
      class="h-auto rounded-full px-3 py-1"
      :loading="importResult.status.value === 'pending'"
      @click="importResult.execute()"
    >
      <Plus class="size-3" />
      Add
    </SpinnerButton>
    <NuxtLink
      v-else
      target="_blank"
      :to="{ name: 'recipes-slug', params: { slug: importResult.data.value! } }"
    >
      <Button variant="outline" class="h-auto rounded-full px-3 py-1 text-sm">
        <Eye class="size-3" />
        View
      </Button>
    </NuxtLink>
  </div>
</template>

<style scoped></style>
