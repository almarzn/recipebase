import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'recipes',
    loadChildren: () =>
      import('./features/recipes/recipes.routes').then((m) => m.ROUTES),
  },
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
];
