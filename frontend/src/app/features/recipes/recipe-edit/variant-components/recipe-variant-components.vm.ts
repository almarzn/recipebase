import { computed, Injectable, inject } from "@angular/core";
import { RecipeEditViewModel } from "../recipe-edit.vm";

@Injectable()
export class RecipeVariantComponentsViewModel {
  readonly parentVm = inject(RecipeEditViewModel);
  readonly recipe = this.parentVm.recipe;

  readonly components = computed(() => this.recipe.value()?.components ?? []);
  readonly hasComponents = computed(() => this.components().length > 0);
  readonly componentCount = computed(() => this.components().length);
}
