<script setup lang="ts">
import { cn } from "~/lib/utils";
import { SearchIcon } from "lucide-vue-next";
import { useMagicKeys } from "@vueuse/core";
import { Recipes } from "~/lib/Recipes";

defineProps<{
  class?: string;
}>();

const getModifier = () => {
  if (
    navigator.platform.indexOf("Mac") === 0 ||
    navigator.platform === "iPhone"
  ) {
    return "⌘"; // command key
  }

  return "^";
};

const open = ref(false);

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === "j" && (e.metaKey || e.ctrlKey)) e.preventDefault();
  },
});

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1]) {
    handleOpenChange();
  }
});
const client = useSupabaseClient();

const allRecipes = await useAsyncData(
  () => {
    return Recipes.using(client).findAllRecipeItems();
  },
  {
    immediate: false,
  },
);

function handleOpenChange() {
  if (allRecipes.status.value === "idle") {
    allRecipes.execute();
  }
  open.value = !open.value;
}

const router = useRouter();

const goTo = (name: Parameters<(typeof router)["push"]>[0]) => {
  router.push(name);

  open.value = false;
};
</script>

<template>
  <Button
    variant="outline"
    :class="
      cn(
        'flex items-center justify-stretch gap-2 overflow-hidden rounded-full border-2 bg-gray-500/5 text-muted-foreground backdrop-blur-2xl max-md:self-stretch md:self-center',
        $props.class,
      )
    "
    @click="handleOpenChange"
  >
    <SearchIcon />

    <div class="min-w-0 shrink truncate">Search any recipe...</div>
    <div class="grow"></div>
    <ClientOnly>
      <div class="rounded-sm border px-1 hover-none:hidden">
        {{ getModifier() }} K
      </div>
    </ClientOnly>
  </Button>

  <CommandDialog v-model:open="open" @select="console.log($event)">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Pages">
        <CommandItem value="/recipes" @select.prevent="() => goTo(`/recipes`)">
          All recipes
        </CommandItem>
        <CommandItem
          value="/settings"
          @select.prevent="() => goTo(`/settings`)"
        >
          Settings
        </CommandItem>
      </CommandGroup>
      <CommandGroup heading="Recipes">
        <CommandEmpty>Loading...</CommandEmpty>
        <CommandItem
          v-for="recipe in allRecipes.data.value ?? []"
          :key="recipe.id"
          :value="`/recipes/${recipe.slug}`"
          @select.prevent="() => goTo(`/recipes/${recipe.slug}`)"
        >
          {{ recipe.name }}
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
    </CommandList>
  </CommandDialog>
</template>
