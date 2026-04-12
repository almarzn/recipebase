import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { provideRecipeDetailViewModel } from "../recipe-detail/recipe-detail.vm";
import { provideRecipeEditViewModel } from "./recipe-edit.vm";
import { RecipeEditNavComponent } from "./recipe-edit-nav.component";

@Component({
  selector: "app-recipe-edit-shell",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RecipeEditNavComponent],
  providers: [provideRecipeDetailViewModel(), provideRecipeEditViewModel()],
  template: `
    <div class="flex gap-8 max-w-6xl mx-auto py-8 px-4" data-testid="recipe-edit-shell">
      <app-recipe-edit-nav class="basis-2/9" />
      <div class="flex-1" data-testid="recipe-edit-shell-content">
        <router-outlet />
      </div>
    </div>
  `,
})
export class RecipeEditShellComponent {}
