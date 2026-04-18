import { httpResource } from "@angular/common/http";
import { computed, Injectable } from "@angular/core";
import type { Item } from "@/shared/models";

@Injectable()
export class RecipeListViewModel {
  private readonly itemsResource = httpResource<Item[]>(() => ({
    url: "/api/items",
    params: { type: "recipe" },
  }));

  readonly items = computed(() => this.itemsResource.value() ?? []);
  readonly loading = this.itemsResource.isLoading;
  readonly error = computed(() => this.itemsResource.error()?.message ?? null);

  readonly hasItems = computed(() => this.items().length > 0);
  readonly itemCount = computed(() => this.items().length);
}
