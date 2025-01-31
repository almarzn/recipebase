import type { ManyRecipeWithTags } from "~/lib/Recipes";
import type { TagProps } from "~/types/recipe";

export const tagList: TagProps[] = [
  {
    id: "853727c2-7f0c-4371-874e-a4ce34af2f0f",
    icon: "dessert",
    text: "Dessert",
    color: "pink",
  },
  {
    id: "b11d86cf-8aa3-426c-a11e-2a96c0addeef",
    icon: null,
    text: "Chocolate",
    color: "neutral",
  },
  {
    id: "d8eb23be-9ba1-4592-922a-1350f2ca3a46",
    icon: null,
    text: "Fruity",
    color: "cyan",
  },
  {
    id: "coffee",
    text: "Coffee",
    icon: null,
    color: "red",
  },
];

export const recipeList: ManyRecipeWithTags[] = [
  {
    id: "f63e5303-b94f-4443-84d5-94cd50198ee4",
    slug: "chocolate-royal-cake-trianon",
    name: "Chocolate Royal cake (“Trianon”)",
    description:
      "A luxurious cake featuring chocolate mousse layered with dacquoise, praline, and a shiny chocolate mirror glaze.",
    tag_ids: [
      "853727c2-7f0c-4371-874e-a4ce34af2f0f",
      "b11d86cf-8aa3-426c-a11e-2a96c0addeef",
    ],
  },
  {
    id: "2886b8f9-3912-472c-95a8-b59893df8a36",
    slug: "buche-de-noel-with-pears-and-chocolate",
    name: "Bûche de Noël with Pears and Chocolate",
    description:
      "A classic French Christmas Yule log featuring hazelnut dacquoise, caramelized pears, and chocolate ganache.",
    tag_ids: [
      "853727c2-7f0c-4371-874e-a4ce34af2f0f",
      "b11d86cf-8aa3-426c-a11e-2a96c0addeef",
      "d8eb23be-9ba1-4592-922a-1350f2ca3a46",
    ],
  },
  {
    slug: "tiramisu",
    description:
      "This classic italian dessert makes for a savoury culinary experience.",
    name: "Tiramisù",
    tag_ids: ["853727c2-7f0c-4371-874e-a4ce34af2f0f", "coffee"],
    id: "tiraisu",
  },
];
