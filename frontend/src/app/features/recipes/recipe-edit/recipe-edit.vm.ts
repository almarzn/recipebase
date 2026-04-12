import { Injectable, inject } from "@angular/core";
import { RecipeDetailViewModel } from "../recipe-detail/recipe-detail.vm";

@Injectable()
export class RecipeEditViewModel {
  private readonly detailVm = inject(RecipeDetailViewModel);

  readonly recipe = this.detailVm.recipe;
  readonly variants = this.detailVm.variants;
  readonly slug = this.detailVm.slug;
}

export const provideRecipeEditViewModel = () => ({
  provide: RecipeEditViewModel,
  useClass: RecipeEditViewModel,
});
