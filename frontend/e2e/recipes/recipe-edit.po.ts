import type { Locator, Page } from "@playwright/test";

export class RecipeEditPage {
  readonly nav: Locator;
  readonly infoLink: Locator;
  readonly componentsLink: Locator;
  readonly recipeTitle: Locator;
  readonly shellContent: Locator;
  readonly recipeName: Locator;
  readonly componentsHeading: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.getByTestId("recipe-edit-nav");
    this.infoLink = page.getByTestId("recipe-edit-info-link");
    this.componentsLink = page.getByTestId("recipe-components-link");
    this.recipeTitle = page.getByTestId("recipe-edit-title");
    this.shellContent = page.getByTestId("recipe-edit-shell-content");
    this.recipeName = page.getByTestId("recipe-name");
    this.componentsHeading = page.getByTestId("components-heading");
  }

  async goto(slug: string, subRoute: string = "info") {
    await this.page.goto(`/recipes/${slug}/edit/${subRoute}`);
  }
}
