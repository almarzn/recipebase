import { computed, inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { httpResource } from "@angular/common/http";
import type { Recipe } from "@/shared/models";

@Injectable()
export class RecipeDetailViewModel {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get("slug")!)));

  private readonly recipeResource = httpResource<Recipe>(() => `/api/recipes/${this.slug()}`);

  readonly recipe = computed(() => this.recipeResource.value() ?? null);
  readonly loading = this.recipeResource.isLoading;
  readonly error = computed(() => this.recipeResource.error()?.message ?? null);

  readonly title = computed(() => this.recipe()?.title ?? "");
  readonly variants = computed(() => this.recipe()?.variants ?? []);
  readonly variantCount = computed(() => this.variants().length);
}
