import type { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./features/home/home.component").then((m) => m.HomePage),
  },
  {
    path: "recipes",
    loadChildren: () => import("./features/recipes/recipes.routes").then((m) => m.ROUTES),
  },
  {
    path: "import",
    loadComponent: () => import("./features/import/import.component").then((m) => m.ImportPage),
  },
];
