<script setup lang="ts">
import type { TagProps } from "~/types/recipe";
import type { Database } from "~/types/database.types";
import type { FunctionalComponent } from "vue";
import {
  Apple,
  Beef,
  Candy,
  Carrot,
  CupSoda,
  Dessert,
  Egg,
  EggOff,
  FishSymbol,
  LeafyGreen,
  type LucideProps,
  Vegan,
  Wheat,
  WheatOff,
} from "lucide-vue-next";

defineProps<{
  tag: Pick<TagProps, "icon">;
  class?: string;
}>();

const icons: Record<
  Database["public"]["Enums"]["tag_icons"],
  FunctionalComponent<LucideProps>
> = {
  apple: Apple,
  beef: Beef,
  candy: Candy,
  carrot: Carrot,
  dessert: Dessert,
  fish_symbol: FishSymbol,
  cup_soda: CupSoda,
  vegan: Vegan,
  leafy_green: LeafyGreen,
  wheat: Wheat,
  wheat_off: WheatOff,
  egg: Egg,
  egg_off: EggOff,
};
</script>

<template>
  <Component :is="icons[tag.icon!]" v-if="tag.icon" :class="$props.class" />
</template>
