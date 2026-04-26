import { computed, Injectable, inject } from "@angular/core";
import { RecipeEditViewModel } from "../recipe-edit.vm";

@Injectable()
export class RecipeComponentsViewModel {
  readonly parentVm = inject(RecipeEditViewModel);
  readonly recipe = this.parentVm.recipe;

  readonly components = computed(() => this.recipe.value()?.components ?? []);

  /** Only the first component for now. */
  readonly firstComponent = computed(() => this.components()[0] ?? null);
}
