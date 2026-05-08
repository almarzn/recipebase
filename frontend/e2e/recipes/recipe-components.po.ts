import type { Locator, Page } from "@playwright/test";

export class RecipeComponentsPage {
  readonly pageHeading: Locator;
  readonly recipeName: Locator;
  readonly heading: Locator;
  readonly description: Locator;
  readonly empty: Locator;

  // Editor (single component)
  readonly editor: Locator;
  readonly editorTitle: Locator;
  readonly ingredientsSection: Locator;
  readonly stepsSection: Locator;
  readonly addIngredientBtn: Locator;
  readonly addStepBtn: Locator;
  readonly saveBtn: Locator;
  readonly saveError: Locator;

  constructor(public readonly page: Page) {
    this.pageHeading = page.getByTestId("components-page");
    this.recipeName = page.getByTestId("recipe-name");
    this.heading = page.getByTestId("components-heading");
    this.description = page.getByTestId("components-description");
    this.empty = page.getByTestId("components-empty");

    this.editor = page.getByTestId("component-editor");
    this.editorTitle = page.getByTestId("component-editor-title");
    this.ingredientsSection = page.getByTestId("component-editor-ingredients");
    this.stepsSection = page.getByTestId("component-editor-steps");
    this.addIngredientBtn = page.getByTestId("component-editor-add-ingredient");
    this.addStepBtn = page.getByTestId("component-editor-add-step");
    this.saveBtn = page.getByTestId("component-editor-save");
    this.saveError = page.getByTestId("component-editor-save-error");
  }

  async goto(slug: string) {
    await this.page.goto(`/recipes/${slug}/edit/components`);
  }

  ingredientRow(index: number): Locator {
    return this.page.getByTestId(`component-editor-ingredient-row-${index}`);
  }

  ingredientToolbar(index: number): Locator {
    return this.ingredientRow(index).getByTestId("ingredient-toolbar");
  }

  ingredientMoveUpBtn(index: number): Locator {
    return this.ingredientRow(index).getByTestId("ingredient-move-up");
  }

  ingredientMoveDownBtn(index: number): Locator {
    return this.ingredientRow(index).getByTestId("ingredient-move-down");
  }

  ingredientToggleNotesBtn(index: number): Locator {
    return this.ingredientRow(index).getByTestId("ingredient-toggle-notes");
  }

  ingredientDeleteBtn(index: number): Locator {
    return this.ingredientRow(index).getByTestId("ingredient-delete");
  }

  ingredientNameInput(index: number): Locator {
    return this.ingredientRow(index).locator('input[placeholder="Ingredient name"]');
  }

  ingredientQuantityInput(index: number): Locator {
    return this.ingredientRow(index).locator('input[placeholder="Quantity"]');
  }

  ingredientNotesTextarea(index: number): Locator {
    return this.ingredientRow(index).locator('textarea[placeholder="Add notes..."]');
  }

  ingredientQuantityError(index: number): Locator {
    return this.ingredientRow(index).getByTestId("ingredient-quantity-error");
  }

  get quantityErrorTooltip(): Locator {
    return this.page.locator('z-tooltip[data-state="opened"]');
  }

  stepRow(index: number): Locator {
    return this.page.getByTestId(`component-editor-step-row-${index}`);
  }

  stepDeleteBtn(index: number): Locator {
    return this.stepRow(index).locator("button").first();
  }

  stepBodyInput(index: number): Locator {
    return this.stepRow(index).locator('input[placeholder="Step instruction..."]');
  }
}
