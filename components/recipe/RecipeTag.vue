<script setup lang="ts">
import type { Database } from "@/types/database.types";
import type { LucideProps } from "lucide-vue-next";
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
  Vegan,
  Wheat,
  WheatOff,
} from "lucide-vue-next";
import Tag from "~/components/ui/tag/Tag.vue";
import type { FunctionalComponent } from "vue";
import type { TagProps } from "~/types/recipe";

const props = defineProps<{
  tag: TagProps;
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
  <Tag :color="tag.color">
    <Component :is="icons[tag.icon!]" v-if="tag.icon" class="size-3" />
    {{ tag.text }}
    <slot />
  </Tag>
</template>
