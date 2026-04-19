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
          import("./variant-components/recipe-variant-components.component").then(
            (m) => m.RecipeVariantComponentsComponent,
          ),
      },
      {
        path: "components/:componentId",
        loadComponent: () =>
          import("./variant-components/recipe-component-detail.component").then(
            (m) => m.RecipeComponentDetailComponent,
          ),
      },
    ],
  },
];
