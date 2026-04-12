import type { Locator, Page } from "@playwright/test";

export class RecipeDetailPage {
  readonly loading: Locator;
  readonly error: Locator;
  readonly notFound: Locator;
  readonly content: Locator;
  readonly header: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly variantSelector: Locator;
  readonly variantSegmentedControl: Locator;
  readonly variantDescription: Locator;
  readonly ingredientListCard: Locator;
  readonly ingredientsHeading: Locator;
  readonly ingredientsEmpty: Locator;
  readonly ingredientsContent: Locator;
  readonly ingredientGroups: Locator;
  readonly ingredientItems: Locator;
  readonly recipeSteps: Locator;
  readonly stepsHeading: Locator;
  readonly stepsEmpty: Locator;
  readonly stepsContent: Locator;
  readonly stepGroups: Locator;
  readonly stepItems: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId("recipe-detail-loading");
    this.error = page.getByTestId("recipe-detail-error");
    this.notFound = page.getByTestId("recipe-detail-not-found");
    this.content = page.getByTestId("recipe-detail-content");
    this.header = page.getByTestId("recipe-header");
    this.title = page.getByTestId("recipe-title");
    this.description = page.getByTestId("recipe-description");
    this.variantSelector = page.getByTestId("recipe-variant-selector");
    this.variantSegmentedControl = page.getByTestId("variant-segmented-control");
    this.variantDescription = page.getByTestId("variant-description");
    this.ingredientListCard = page.getByTestId("ingredient-list-card");
    this.ingredientsHeading = page.getByTestId("ingredients-heading");
    this.ingredientsEmpty = page.getByTestId("ingredients-empty");
    this.ingredientsContent = page.getByTestId("ingredients-content");
    this.ingredientGroups = page.getByTestId("ingredient-group");
    this.ingredientItems = page.getByTestId("ingredient-item");
    this.recipeSteps = page.getByTestId("recipe-steps");
    this.stepsHeading = page.getByTestId("steps-heading");
    this.stepsEmpty = page.getByTestId("steps-empty");
    this.stepsContent = page.getByTestId("steps-content");
    this.stepGroups = page.getByTestId("steps-group");
    this.stepItems = page.getByTestId("step-item");
  }

  async goto(slug: string, variantSlug?: string) {
    const url = variantSlug ? `/recipes/${slug}/variants/${variantSlug}` : `/recipes/${slug}`;
    await this.page.goto(url);
  }

  async selectVariant(variantValue: string) {
    await this.variantSegmentedControl.click();
    await this.page.getByRole("radio", { name: variantValue }).click();
  }

  ingredientName(index: number): Locator {
    return this.ingredientItems.nth(index).getByTestId("ingredient-name");
  }

  ingredientQuantity(index: number): Locator {
    return this.ingredientItems.nth(index).getByTestId("ingredient-quantity");
  }

  ingredientNotes(index: number): Locator {
    return this.ingredientItems.nth(index).getByTestId("ingredient-notes");
  }

  componentTitle(index: number): Locator {
    return this.ingredientGroups.nth(index).getByTestId("component-title");
  }

  stepNumber(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-number");
  }

  stepText(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-text");
  }

  stepNotes(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-notes");
  }

  stepTimer(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-timer");
  }

  stepsComponentTitle(index: number): Locator {
    return this.stepGroups.nth(index).getByTestId("steps-component-title");
  }

  timerToggle(index: number): Locator {
    return this.stepTimer(index).getByTestId("timer-toggle");
  }

  timerReset(index: number): Locator {
    return this.stepTimer(index).getByTestId("timer-reset");
  }

  timerDisplay(index: number): Locator {
    return this.timerToggle(index).locator("span");
  }
}
