import { computed, Injectable, inject } from "@angular/core";
import { RecipeEditViewModel } from "../recipe-edit.vm";

@Injectable()
export class RecipeVariantComponentsViewModel {
  readonly parentVm = inject(RecipeEditViewModel);
  readonly variant = this.parentVm.activeVariant;

  readonly components = computed(() => this.variant()?.components ?? []);
  readonly hasComponents = computed(() => this.components().length > 0);
  readonly componentCount = computed(() => this.components().length);
}
