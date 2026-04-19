import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeDetailPage } from "./recipe-detail.po";

const mockRecipeWithComponents: Recipe = {
  id: "1",
  slug: "pasta",
  name: "Fresh Pasta",
  tags: ["dessert", "italian"],
  source: { type: "original" },
  yield: { quantity: 4, unit: "servings", description: null },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  components: [
    {
      id: "comp-1",
      slug: "dough",
      name: "Dough",
      position: 1,
      ingredients: [
        {
          id: "ing-1",
          slug: "semolina",
          name: "Semolina flour",
          notes: "Fine grind preferred",
          quantity: { unit: "gram", amount: 300 },
          position: 1,
        },
        {
          id: "ing-2",
          slug: "eggs",
          name: "Large eggs",
          notes: null,
          quantity: { unit: "gram", amount: 150 },
          position: 2,
        },
      ],
      steps: [
        {
          id: "step-1",
          slug: "mix",
          order: 1,
          body: "Mix flour and eggs in a large bowl",
          timer: null,
        },
        {
          id: "step-2",
          slug: "knead",
          order: 2,
          body: "Knead for 10 minutes until smooth",
          timer: "PT10M",
        },
      ],
    },
  ],
};

const mockRecipeMinimal: Recipe = {
  id: "2",
  slug: "simple-salad",
  name: "Simple Salad",
  tags: [],
  source: null,
  yield: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  components: [
    {
      id: "comp-3",
      slug: "base",
      name: "Base",
      position: 1,
      ingredients: [],
      steps: [],
    },
  ],
};

const mockRecipeMultiComponent: Recipe = {
  id: "3",
  slug: "lasagna",
  name: "Lasagna",
  tags: ["italian"],
  source: null,
  yield: { quantity: 8, unit: "servings", description: null },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  components: [
    {
      id: "comp-4",
      slug: "ragu",
      name: "Ragu",
      position: 1,
      ingredients: [
        {
          id: "ing-3",
          slug: "beef",
          name: "Ground beef",
          notes: null,
          quantity: { unit: "gram", amount: 500 },
          position: 1,
        },
      ],
      steps: [
        {
          id: "step-4",
          slug: "brown",
          order: 1,
          body: "Brown the beef",
          timer: null,
        },
      ],
    },
    {
      id: "comp-5",
      slug: "bechamel",
      name: "Bechamel",
      position: 2,
      ingredients: [
        {
          id: "ing-4",
          slug: "milk",
          name: "Whole milk",
          notes: null,
          quantity: { unit: "milliliter", amount: 1000 },
          position: 1,
        },
      ],
      steps: [
        {
          id: "step-5",
          slug: "make-sauce",
          order: 1,
          body: "Make the bechamel",
          timer: null,
        },
      ],
    },
  ],
};

test("recipe detail — loading state", async ({ page }) => {
  // Route must be set up before navigation
  await page.route("**/api/recipes/pasta", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithComponents),
    });
  });

  const detail = new RecipeDetailPage(page);

  await test.step("shows loading indicator", async () => {
    await detail.goto("pasta");
    await expect(detail.loading).toBeVisible();
  });
});

test("recipe detail — error state", async ({ page }) => {
  await page.route("**/api/recipes/**", (route) => {
    if (route.request().url().includes("error-recipe")) {
      return route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Failed to load recipe" }),
      });
    }
    return route.continue();
  });

  const detail = new RecipeDetailPage(page);
  await detail.goto("error-recipe");

  await test.step("shows error message", async () => {
    await expect(detail.error).toBeVisible();
    await expect(detail.error).toContainText("Failed to load recipe");
  });

  await test.step("does not show content or loading", async () => {
    await expect(detail.content).not.toBeVisible();
    await expect(detail.loading).not.toBeVisible();
  });
});

test("recipe detail — not found state", async ({ page }) => {
  await page.route("**/api/recipes/**", (route) => {
    if (route.request().url().includes("not-found")) {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Recipe not found" }),
      });
    }
    return route.continue();
  });

  const detail = new RecipeDetailPage(page);
  await detail.goto("not-found");

  await test.step("shows not found message", async () => {
    await expect(detail.notFound).toBeVisible();
    await expect(detail.notFound).toContainText("Recipe not found");
  });
});

test("recipe detail — displays full recipe with all data", async ({ page }) => {
  // Set up route BEFORE navigation - critical for httpResource interception
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithComponents),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("pasta");

  // Wait for content to be visible first
  await expect(detail.content).toBeVisible();

  await test.step("shows recipe header with title and tags", async () => {
    await expect(detail.header).toBeVisible();
    await expect(detail.title).toHaveText("Fresh Pasta");
  });

  await test.step("shows yield information", async () => {
    await expect(detail.yield).toBeVisible();
    await expect(detail.yield).toContainText("4 servings");
  });

  await test.step("shows ingredient list with correct structure", async () => {
    await expect(detail.ingredientListCard).toBeVisible();
    await expect(detail.ingredientsHeading).toHaveText("Ingredients");
    await expect(detail.ingredientsContent).toBeVisible();
  });

  await test.step("displays component name in ingredients", async () => {
    await expect(detail.componentName(0)).toHaveText("Dough");
  });

  await test.step("displays all ingredients with names and quantities", async () => {
    await expect(detail.ingredientItems).toHaveCount(2);
    await expect(detail.ingredientName(0)).toHaveText("Semolina flour");
    await expect(detail.ingredientQuantity(0)).toContainText("300");
    await expect(detail.ingredientName(1)).toHaveText("Large eggs");
  });

  await test.step("displays ingredient notes when present", async () => {
    await expect(detail.ingredientNotes(0)).toHaveText("Fine grind preferred");
  });

  await test.step("shows steps section with correct structure", async () => {
    await expect(detail.recipeSteps).toBeVisible();
    await expect(detail.stepsHeading).toHaveText("Instructions");
    await expect(detail.stepsContent).toBeVisible();
  });

  await test.step("displays step numbers", async () => {
    await expect(detail.stepItems).toHaveCount(2);
    await expect(detail.stepNumber(0)).toHaveText("01");
    await expect(detail.stepNumber(1)).toHaveText("02");
  });

  await test.step("displays step body", async () => {
    await expect(detail.stepBody(0)).toHaveText("Mix flour and eggs in a large bowl");
    await expect(detail.stepBody(1)).toHaveText("Knead for 10 minutes until smooth");
  });

  await test.step("displays timer when present", async () => {
    await expect(detail.stepTimer(1)).toBeVisible();
    await expect(detail.timerDisplay(1)).toHaveText("10:00");
  });
});

test("recipe detail — handles recipe with no ingredients", async ({ page }) => {
  // Set up route BEFORE navigation
  await page.route("**/api/recipes/simple-salad", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMinimal),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("simple-salad");

  // Wait for content to load
  await expect(detail.content).toBeVisible();

  await test.step("shows empty ingredients message", async () => {
    await expect(detail.ingredientsEmpty).toBeVisible();
    await expect(detail.ingredientsEmpty).toContainText("No ingredients listed for this recipe");
  });

  await test.step("does not show ingredients content", async () => {
    await expect(detail.ingredientsContent).not.toBeVisible();
  });
});

test("recipe detail — handles recipe with no steps", async ({ page }) => {
  // Set up route BEFORE navigation
  await page.route("**/api/recipes/simple-salad", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMinimal),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("simple-salad");

  // Wait for content to load
  await expect(detail.content).toBeVisible();

  await test.step("shows empty steps message", async () => {
    await expect(detail.stepsEmpty).toBeVisible();
    await expect(detail.stepsEmpty).toContainText("No instructions listed for this recipe");
  });

  await test.step("does not show steps content", async () => {
    await expect(detail.stepsContent).not.toBeVisible();
  });
});

test("recipe detail — displays multiple components correctly", async ({ page }) => {
  // Set up route BEFORE navigation
  await page.route("**/api/recipes/lasagna", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMultiComponent),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("lasagna");

  // Wait for content to load
  await expect(detail.content).toBeVisible();

  await test.step("shows multiple component sections", async () => {
    await expect(detail.componentSections).toHaveCount(2);
    await expect(detail.componentName(0)).toHaveText("Ragu");
    await expect(detail.componentName(1)).toHaveText("Bechamel");
  });

  await test.step("step numbers reset for each component", async () => {
    await expect(detail.stepNumber(0)).toHaveText("01");
    await expect(detail.stepNumber(1)).toHaveText("01");
  });
});
