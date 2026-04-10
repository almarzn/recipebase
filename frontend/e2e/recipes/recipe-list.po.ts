import { type Page, type Locator } from '@playwright/test';

export class RecipeListPage {
  readonly loading: Locator;
  readonly error: Locator;
  readonly empty: Locator;
  readonly count: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId('recipe-list-loading');
    this.error = page.getByTestId('recipe-list-error');
    this.empty = page.getByTestId('recipe-list-empty');
    this.count = page.getByTestId('recipe-list-count');
  }

  async goto() {
    await this.page.goto('/recipes');
  }
}
