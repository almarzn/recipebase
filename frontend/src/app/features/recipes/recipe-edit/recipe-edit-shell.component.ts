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
    <div class="flex">
      <app-recipe-edit-nav />
      <div class="flex-1">
        <router-outlet />
      </div>
    </div>
  `,
})
export class RecipeEditShellComponent {}
