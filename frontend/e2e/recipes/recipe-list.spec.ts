import { test, expect } from "@playwright/test";
import { RecipeListPage } from "./recipe-list.po";

const mockRecipes = [
  {
    id: "1",
    slug: "pasta",
    title: "Fresh Pasta",
    description: "Handmade pasta with semolina flour and eggs",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    variants: [
      { slug: "classic", name: "Classic" },
      { slug: "spinach", name: "Spinach" },
    ],
  },
  {
    id: "2",
    slug: "salad",
    title: "Garden Salad",
    description: null,
    createdAt: "2026-03-15T00:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
    variants: [{ slug: "simple", name: "Simple" }],
  },
  {
    id: "3",
    slug: "chocolate-cake",
    title: "Chocolate Cake",
    description: "Rich dark chocolate layer cake with ganache frosting and a moist crumb",
    createdAt: "2025-12-25T00:00:00Z",
    updatedAt: "2025-12-25T00:00:00Z",
    variants: [],
  },
];

test("recipe list — loading state", async ({ page }) => {
  await page.route("**/api/recipes", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  const recipeList = new RecipeListPage(page);

  await test.step("shows skeleton loaders", async () => {
    await recipeList.goto();
    await expect(recipeList.loading).toBeVisible();
  });
});

test("recipe list — empty state", async ({ page }) => {
  await page.route("**/api/recipes", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step("shows empty message", async () => {
    await expect(recipeList.empty).toBeVisible();
    await expect(recipeList.empty).toContainText("No recipes yet");
  });

  await test.step("does not show grid or error", async () => {
    await expect(recipeList.grid).not.toBeVisible();
    await expect(recipeList.error).not.toBeVisible();
  });
});

test("recipe list — populated state", async ({ page }) => {
  await page.route("**/api/recipes", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipes),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step("shows grid with all recipes", async () => {
    await expect(recipeList.grid).toBeVisible();
    await expect(recipeList.recipeCards).toHaveCount(3);
  });

  await test.step("displays recipe titles", async () => {
    await expect(recipeList.recipeTitle(0)).toHaveText("Fresh Pasta");
    await expect(recipeList.recipeTitle(1)).toHaveText("Garden Salad");
    await expect(recipeList.recipeTitle(2)).toHaveText("Chocolate Cake");
  });

  await test.step("displays descriptions where present", async () => {
    await expect(recipeList.recipeDescription(0)).toHaveText(/semolina/);
    await expect(recipeList.recipeDescription(2)).toHaveText(/ganache/);
  });

  await test.step("displays variant badges", async () => {
    await expect(recipeList.recipeVariantBadges(0)).toHaveCount(2);
    await expect(recipeList.recipeVariantBadges(1)).toHaveCount(1);
    await expect(recipeList.recipeVariantBadges(2)).toHaveCount(0);
  });

  await test.step("displays formatted dates", async () => {
    await expect(recipeList.recipeDate(0)).toHaveText("Jan 1, 2026");
    await expect(recipeList.recipeDate(1)).toHaveText("Mar 15, 2026");
    await expect(recipeList.recipeDate(2)).toHaveText("Dec 25, 2025");
  });
});

test("recipe list — error state", async ({ page }) => {
  await page.route("**/api/recipes", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Internal error" }),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step("shows error message", async () => {
    await expect(recipeList.error).toBeVisible();
    await expect(recipeList.error).toContainText("Failed to load recipes");
  });

  await test.step("does not show grid or empty", async () => {
    await expect(recipeList.grid).not.toBeVisible();
    await expect(recipeList.empty).not.toBeVisible();
  });
});

test("recipe card navigates to detail", async ({ page }) => {
  await page.route("**/api/recipes", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipes),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step("clicking a card navigates to recipe detail", async () => {
    await recipeList.recipeCards.first().click();
    await expect(page).toHaveURL(/\/recipes\/pasta/);
  });
});
