import type { Routes } from "@angular/router";

export const ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./recipe-list/recipe-list").then((m) => m.RecipeListPage),
  },
  {
    path: ":slug",
    loadComponent: () => import("./recipe-detail/recipe-detail.component").then((m) => m.RecipeDetailPage),
  },
  {
    path: ":slug/:variantSlug",
    loadComponent: () => import("./recipe-detail/recipe-detail.component").then((m) => m.RecipeDetailPage),
  },
];
