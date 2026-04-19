import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { RecipeDetailViewModel } from "../recipe-detail/recipe-detail.vm";

@Injectable()
export class RecipeEditViewModel {
  readonly detailVm: RecipeDetailViewModel;
  readonly recipe;
  readonly slug;

  constructor() {
    this.detailVm = inject(RecipeDetailViewModel);

    this.recipe = this.detailVm.recipe;
    this.slug = toSignal(
      inject(ActivatedRoute).paramMap.pipe(
        map((p) => p.get("slug")),
        filter((s): s is string => s !== null),
      ),
      { requireSync: true },
    );
  }
}

export const provideRecipeEditViewModel = () => ({
  provide: RecipeEditViewModel,
  useClass: RecipeEditViewModel,
});
