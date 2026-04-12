import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { RecipeDetailViewModel } from "../recipe-detail/recipe-detail.vm";

@Injectable()
export class RecipeEditViewModel {
  private readonly detailVm: RecipeDetailViewModel;
  readonly recipe;
  readonly variants;
  readonly slug;
  readonly variantSlug;
  private router;

  constructor() {
    this.detailVm = inject(RecipeDetailViewModel);
    this.router = inject(Router);

    this.recipe = this.detailVm.recipe;
    this.variants = this.detailVm.variants;
    this.slug = this.detailVm.slug;

    this.variantSlug = toSignal(
      inject(Router).events.pipe(
        filter((e) => e instanceof NavigationEnd),
        startWith(null),
        map(() => {
          let route = this.router.routerState.snapshot.root;
          while (route.firstChild) route = route.firstChild;
          return route.params["variantSlug"];
        }),
      ),
    );
  }

  setActiveVariant(slug: string) {
    this.router.navigate(["/recipes", this.slug(), "edit", "variants", slug]);
  }
}

export const provideRecipeEditViewModel = () => ({
  provide: RecipeEditViewModel,
  useClass: RecipeEditViewModel,
});
