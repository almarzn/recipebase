import type { Locator, Page } from "@playwright/test";

export class RecipeListPage {
  readonly loading: Locator;
  readonly error: Locator;
  readonly empty: Locator;
  readonly grid: Locator;
  readonly recipeCards: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId("recipe-list-loading");
    this.error = page.getByTestId("recipe-list-error");
    this.empty = page.getByTestId("recipe-list-empty");
    this.grid = page.getByTestId("recipe-list-grid");
    this.recipeCards = page.getByTestId("recipe-card");
  }

  async goto() {
    await this.page.goto("/recipes");
  }

  recipeTitle(index: number): Locator {
    return this.recipeCards.nth(index).locator('[data-slot="card-title"]');
  }

  recipeTagBadges(index: number): Locator {
    return this.recipeCards.nth(index).getByTestId("recipe-tag-badge");
  }
}
