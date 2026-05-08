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

  test("notes textarea stays visible after typing then clearing", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("ingredient 1 has empty notes, textarea hidden by default", async () => {
      await expect(editor.ingredientNotesTextarea(1)).not.toBeVisible();
    });

    await test.step("click toggle to show empty textarea", async () => {
      await editor.ingredientToggleNotesBtn(1).click();
      await expect(editor.ingredientNotesTextarea(1)).toBeVisible();
    });

    await test.step("type text then clear it, textarea should stay visible", async () => {
      await editor.ingredientNotesTextarea(1).fill("hello world");
      await editor.ingredientNotesTextarea(1).fill("");
      await editor.ingredientNotesTextarea(1).blur();
      await expect(editor.ingredientNotesTextarea(1)).toBeVisible();
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

  test("save sends correct PUT request with modified ingredients and steps", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    await page.route("**/api/recipes/pasta/components/dough", (route) => {
      if (route.request().method() === "PUT") {
        return route.fulfill({ status: 204 });
      }
      return route.continue();
    });

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("modify ingredient name and quantity", async () => {
      await editor.ingredientNameInput(0).fill("Bread Flour");
      await editor.ingredientQuantityInput(0).fill("450 g");
      await expect(editor.ingredientNameInput(0)).toHaveValue("Bread Flour");
      await expect(editor.ingredientQuantityInput(0)).toHaveValue("450 g");
    });

    await test.step("modify a step body", async () => {
      await editor.stepBodyInput(0).fill("Sift flour first.");
      await expect(editor.stepBodyInput(0)).toHaveValue("Sift flour first.");
    });

    await test.step("save and verify PUT request payload", async () => {
      const [putRequest] = await Promise.all([
        page.waitForRequest(
          (req) => req.method() === "PUT" && req.url().includes("/api/recipes/pasta/components/dough"),
        ),
        editor.saveBtn.click(),
      ]);

      const body = putRequest.postDataJSON();

      expect(body.name).toBeNull();

      expect(body.ingredients).toHaveLength(2);
      expect(body.ingredients[0].slug).toBe("flour");
      expect(body.ingredients[0].name).toBe("Bread Flour");
      expect(body.ingredients[0].quantity).toEqual({
        type: "decimal",
        amount: 450,
        unit: { type: "gram" },
      });
      expect(body.ingredients[0].notes).toBe("Type 00");

      expect(body.ingredients[1].slug).toBe("eggs");
      expect(body.ingredients[1].name).toBe("Eggs");
      expect(body.ingredients[1].quantity.type).toBe("decimal");

      expect(body.steps).toHaveLength(2);
      expect(body.steps[0].body).toBe("Sift flour first.");
      expect(body.steps[0].timer).toBeNull();
      expect(body.steps[1].body).toBe("Knead for 10 minutes.");
    });
  });

  test("save shows API error message", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    await page.route("**/api/recipes/pasta/components/dough", (route) => {
      if (route.request().method() === "PUT") {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Database constraint violation" }),
        });
      }
      return route.continue();
    });

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("click save with valid data triggers API error", async () => {
      const [putRequest] = await Promise.all([
        page.waitForRequest(
          (req) => req.method() === "PUT" && req.url().includes("/api/recipes/pasta/components/dough"),
        ),
        editor.saveBtn.click(),
      ]);

      expect(putRequest).toBeTruthy();
    });

    await test.step("verify error message is displayed", async () => {
      await expect(editor.saveError).toBeVisible();
      await expect(editor.saveError).toContainText("Database constraint violation");
    });
  });

  test("save with new ingredient generates slug from name", async ({ page }) => {
    await page.route("**/api/recipes/pasta", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      }),
    );

    await page.route("**/api/recipes/pasta/components/dough", (route) => {
      if (route.request().method() === "PUT") {
        return route.fulfill({ status: 204 });
      }
      return route.continue();
    });

    const editor = new RecipeComponentsPage(page);
    await editor.goto("pasta");

    await test.step("add a new ingredient", async () => {
      await editor.addIngredientBtn.click();
      await expect(editor.ingredientRow(2)).toBeVisible();
    });

    await test.step("fill new ingredient and save", async () => {
      await editor.ingredientNameInput(2).fill("Olive Oil");
      await editor.ingredientQuantityInput(2).fill("30 ml");
      await expect(editor.ingredientNameInput(2)).toHaveValue("Olive Oil");
      await expect(editor.ingredientQuantityInput(2)).toHaveValue("30 ml");

      const [putRequest] = await Promise.all([
        page.waitForRequest(
          (req) => req.method() === "PUT" && req.url().includes("/api/recipes/pasta/components/dough"),
        ),
        editor.saveBtn.click(),
      ]);

      const body = putRequest.postDataJSON();

      expect(body.ingredients).toHaveLength(3);
      expect(body.ingredients[2].slug).toBe("olive-oil");
      expect(body.ingredients[2].name).toBe("Olive Oil");
      expect(body.ingredients[2].quantity).toEqual({
        type: "decimal",
        amount: 30,
        unit: { type: "milliliter" },
      });
      expect(body.ingredients[2].notes).toBeNull();
    });
  });
});
