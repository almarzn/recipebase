import type { Routes } from "@angular/router";

export const ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./recipe-edit-shell.component").then((m) => m.RecipeEditShellComponent),
    children: [
      {
        path: "",
        redirectTo: "info",
        pathMatch: "full",
      },
      {
        path: "info",
        loadComponent: () => import("./recipe-edit-info.component").then((m) => m.RecipeEditInfoComponent),
      },
      {
        path: "components",
        loadComponent: () =>
          import("./components/recipe-components.component").then((m) => m.RecipeComponentsComponent),
      },
    ],
  },
];
