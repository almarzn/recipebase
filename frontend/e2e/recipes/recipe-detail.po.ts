import type { Locator, Page } from "@playwright/test";

export class RecipeDetailPage {
  readonly loading: Locator;
  readonly error: Locator;
  readonly notFound: Locator;
  readonly content: Locator;
  readonly header: Locator;
  readonly title: Locator;
  readonly yield: Locator;
  readonly tags: Locator;
  readonly ingredientListCard: Locator;
  readonly ingredientsHeading: Locator;
  readonly ingredientsEmpty: Locator;
  readonly ingredientsContent: Locator;
  readonly componentSections: Locator;
  readonly ingredientItems: Locator;
  readonly recipeSteps: Locator;
  readonly stepsHeading: Locator;
  readonly stepsEmpty: Locator;
  readonly stepsContent: Locator;
  readonly stepItems: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId("recipe-detail-loading");
    this.error = page.getByTestId("recipe-detail-error");
    this.notFound = page.getByTestId("recipe-detail-not-found");
    this.content = page.getByTestId("recipe-detail-content");
    this.header = page.getByTestId("recipe-header");
    this.title = page.getByTestId("recipe-title");
    this.yield = page.getByTestId("recipe-yield");
    this.tags = page.getByTestId("recipe-tags");
    this.ingredientListCard = page.getByTestId("ingredient-list-card");
    this.ingredientsHeading = page.getByTestId("ingredients-heading");
    this.ingredientsEmpty = page.getByTestId("ingredients-empty");
    this.ingredientsContent = page.getByTestId("ingredients-content");
    this.componentSections = page.locator("[data-testid='component-section']");
    this.ingredientItems = page.getByTestId("ingredient-item");
    this.recipeSteps = page.getByTestId("recipe-steps");
    this.stepsHeading = page.getByTestId("steps-heading");
    this.stepsEmpty = page.getByTestId("steps-empty");
    this.stepsContent = page.getByTestId("steps-content");
    this.stepItems = page.getByTestId("step-item");
  }

  async goto(slug: string) {
    await this.page.goto(`/recipes/${slug}`);
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

  componentName(index: number): Locator {
    return this.componentSections.nth(index).getByTestId("component-name");
  }

  stepNumber(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-number");
  }

  stepBody(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-body");
  }

  stepTimer(index: number): Locator {
    return this.stepItems.nth(index).getByTestId("step-timer");
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
