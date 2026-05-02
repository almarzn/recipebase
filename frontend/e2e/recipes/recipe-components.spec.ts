import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeComponentsPage } from "./recipe-components.po";

const mockRecipe: Recipe = {
  id: "1",
  slug: "pasta",
  name: "Fresh Pasta",
  tags: ["italian"],
  source: { type: "original" },
  yield: {
    quantity: { type: "decimal", unit: { type: "custom", name: "servings" }, amount: 4 },
    description: null,
  },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  notes: null,
  components: [
    {
      id: "comp-1",
      slug: "dough",
      name: null,
      position: 1,
      ingredients: [
        {
          id: "ing-1",
          slug: "flour",
          name: "Flour",
          quantity: { type: "decimal", amount: 500, unit: { type: "gram" } },
          notes: "Type 00",
          position: 1,
        },
        {
          id: "ing-2",
          slug: "eggs",
          name: "Eggs",
          quantity: { type: "decimal", amount: 5, unit: { type: "arbitrary" } },
          notes: null,
          position: 2,
        },
      ],
      steps: [
        {
          id: "step-1",
          slug: "mix",
          stepOrder: 1,
          body: "Mix flour and eggs until combined.",
          timer: null,
        },
        {
          id: "step-2",
          slug: "knead",
          stepOrder: 2,
          body: "Knead for 10 minutes.",
          timer: null,
        },
      ],
    },
  ],
} as Recipe;

test.describe("recipe components editor", () => {
  test("displays first component with pre-populated ingredients and steps", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("shows page heading and recipe name", async () => {
      await expect(editor.pageHeading).toBeVisible();
      await expect(editor.recipeName).toHaveText("Fresh Pasta");
      await expect(editor.heading).toHaveText("Components");
    });

    await test.step("shows component editor with default title for null name", async () => {
      await expect(editor.editor).toBeVisible();
      await expect(editor.editorTitle).toHaveText("Component 1");
    });

    await test.step("pre-populates ingredients from API", async () => {
      await expect(editor.ingredientRow(0)).toBeVisible();
      await expect(editor.ingredientNameInput(0)).toHaveValue("Flour");
      await expect(editor.ingredientQuantityInput(0)).toHaveValue("500 g");

      await expect(editor.ingredientRow(1)).toBeVisible();
      await expect(editor.ingredientNameInput(1)).toHaveValue("Eggs");
      await expect(editor.ingredientQuantityInput(1)).toHaveValue("5");
    });

    await test.step("notes textarea visible for ingredient with notes, hidden for empty notes", async () => {
      await expect(editor.ingredientNotesTextarea(0)).toBeVisible();
      await expect(editor.ingredientNotesTextarea(0)).toHaveValue("Type 00");

      await expect(editor.ingredientNotesTextarea(1)).not.toBeVisible();
    });

    await test.step("pre-populates steps from API", async () => {
      await expect(editor.stepRow(0)).toBeVisible();
      await expect(editor.stepBodyInput(0)).toHaveValue("Mix flour and eggs until combined.");

      await expect(editor.stepRow(1)).toBeVisible();
      await expect(editor.stepBodyInput(1)).toHaveValue("Knead for 10 minutes.");
    });
  });

  test("adds and deletes ingredients", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("adds a new ingredient row with empty fields", async () => {
      await expect(editor.ingredientRow(0)).toHaveCount(1);
      await expect(editor.ingredientRow(1)).toHaveCount(1);

      await editor.addIngredientBtn.click();

      await expect(editor.ingredientRow(2)).toBeVisible();
      await expect(editor.ingredientNameInput(2)).toHaveValue("");
      await expect(editor.ingredientQuantityInput(2)).toHaveValue("");
    });

    await test.step("deletes first ingredient", async () => {
      await editor.ingredientDeleteBtn(0).click();

      // The old index 1 should now be index 0
      await expect(editor.ingredientNameInput(0)).toHaveValue("Eggs");
      await expect(editor.ingredientRow(0)).toHaveCount(1);
      // The newly added ingredient should now be index 1
      await expect(editor.ingredientRow(1)).toBeVisible();
    });
  });

  test("adds and deletes steps", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("adds a new step row with empty body", async () => {
      await expect(editor.stepRow(0)).toHaveCount(1);
      await expect(editor.stepRow(1)).toHaveCount(1);

      await editor.addStepBtn.click();

      await expect(editor.stepRow(2)).toBeVisible();
      await expect(editor.stepBodyInput(2)).toHaveValue("");
    });

    await test.step("deletes first step", async () => {
      await editor.stepDeleteBtn(0).click();

      await expect(editor.stepBodyInput(0)).toHaveValue("Knead for 10 minutes.");
      await expect(editor.stepRow(1)).toBeVisible();
    });
  });

  test("shows quantity parse error on save with invalid quantity", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("enter invalid empty quantity", async () => {
      await editor.ingredientQuantityInput(0).fill("");
      await editor.ingredientQuantityInput(0).blur();
    });

    await test.step("save triggers validation, error icon appears inside the quantity input", async () => {
      await editor.saveBtn.click();
      await expect(editor.ingredientQuantityError(0)).toBeVisible();
      await expect(editor.saveError).toBeVisible();
    });

    await test.step("hover over error icon shows tooltip with parse error message", async () => {
      await editor.ingredientQuantityError(0).hover();
      await expect(editor.quantityErrorTooltip).toBeVisible();
      await expect(editor.quantityErrorTooltip).toContainText("Cannot parse empty quantity text");
    });
  });

  test("ingredient toolbar buttons", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("first ingredient toolbar: move up disabled, move down enabled", async () => {
      await expect(editor.ingredientMoveUpBtn(0)).toBeDisabled();
      await expect(editor.ingredientMoveDownBtn(0)).toBeEnabled();
    });

    await test.step("second ingredient toolbar: move up enabled, move down disabled", async () => {
      await expect(editor.ingredientMoveUpBtn(1)).toBeEnabled();
      await expect(editor.ingredientMoveDownBtn(1)).toBeDisabled();
    });

    await test.step("toolbar has delete and notes toggle buttons", async () => {
      await expect(editor.ingredientDeleteBtn(0)).toBeVisible();
      await expect(editor.ingredientToggleNotesBtn(0)).toBeVisible();
    });
  });

  test("ingredient notes toggle shows and hides textarea", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("notes textarea visible by default for ingredient with notes", async () => {
      await expect(editor.ingredientNotesTextarea(0)).toBeVisible();
      await expect(editor.ingredientNotesTextarea(0)).toHaveValue("Type 00");
    });

    await test.step("click toggle hides textarea for ingredient with notes", async () => {
      await editor.ingredientToggleNotesBtn(0).click();
      await expect(editor.ingredientNotesTextarea(0)).not.toBeVisible();
    });

    await test.step("notes textarea hidden by default for ingredient with empty notes", async () => {
      await expect(editor.ingredientNotesTextarea(1)).not.toBeVisible();
    });

    await test.step("click toggle shows empty textarea for ingredient without notes", async () => {
      await editor.ingredientToggleNotesBtn(1).click();
      await expect(editor.ingredientNotesTextarea(1)).toBeVisible();
      await expect(editor.ingredientNotesTextarea(1)).toHaveValue("");
    });
  });

  test("moving ingredients up and down", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("initial order is Flour then Eggs", async () => {
      await expect(editor.ingredientNameInput(0)).toHaveValue("Flour");
      await expect(editor.ingredientNameInput(1)).toHaveValue("Eggs");
    });

    await test.step("move first ingredient down swaps order", async () => {
      await editor.ingredientMoveDownBtn(0).click();
      await expect(editor.ingredientNameInput(0)).toHaveValue("Eggs");
      await expect(editor.ingredientNameInput(1)).toHaveValue("Flour");
    });

    await test.step("move second ingredient up restores original order", async () => {
      await editor.ingredientMoveUpBtn(1).click();
      await expect(editor.ingredientNameInput(0)).toHaveValue("Flour");
      await expect(editor.ingredientNameInput(1)).toHaveValue("Eggs");
    });
  });

  test("shows empty state when no components", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...mockRecipe, components: [] }),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("shows empty state instead of editor", async () => {
      await expect(editor.empty).toBeVisible();
      await expect(editor.editor).not.toBeVisible();
    });
  });
});
