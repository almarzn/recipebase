import type { Locator, Page } from "@playwright/test";

export class RecipeEditPage {
  readonly nav: Locator;
  readonly infoLink: Locator;
  readonly recipeTitle: Locator;
  readonly variantSelect: Locator;
  readonly shellContent: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.getByTestId("recipe-edit-nav");
    this.infoLink = page.getByTestId("recipe-edit-info-link");
    this.recipeTitle = page.getByTestId("recipe-edit-title");
    this.variantSelect = page.getByTestId("recipe-edit-variant-select");
    this.shellContent = page.getByTestId("recipe-edit-shell-content");
  }

  async goto(slug: string, subRoute: string = "info") {
    await this.page.goto(`/recipes/${slug}/edit/${subRoute}`);
  }

  variantOption(slug: string): Locator {
    return this.page.getByTestId(`variant-option-${slug}`);
  }

  async selectVariant(slug: string) {
    await this.variantSelect.click();
    await this.variantOption(slug).click();
  }
}
