import { expect, test } from "@playwright/test";
import { RecipeListPage } from "./recipe-list.po";

const mockItems = [
  {
    id: "1",
    slug: "pasta",
    type: "recipe",
    name: "Fresh Pasta",
    tags: ["italian", "vegetarian"],
  },
  {
    id: "2",
    slug: "salad",
    type: "recipe",
    name: "Garden Salad",
    tags: [],
  },
  {
    id: "3",
    slug: "chocolate-cake",
    type: "recipe",
    name: "Chocolate Cake",
    tags: ["dessert", "chocolate", "cake"],
  },
];

test("recipe list — loading state", async ({ page }) => {
  await page.route("**/api/items*", async (route) => {
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
  await page.route("**/api/items*", (route) =>
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
  await page.route("**/api/items*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockItems),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step("shows grid with all recipes", async () => {
    await expect(recipeList.grid).toBeVisible();
    await expect(recipeList.recipeCards).toHaveCount(3);
  });

  await test.step("displays recipe names", async () => {
    await expect(recipeList.recipeTitle(0)).toHaveText("Fresh Pasta");
    await expect(recipeList.recipeTitle(1)).toHaveText("Garden Salad");
    await expect(recipeList.recipeTitle(2)).toHaveText("Chocolate Cake");
  });

  await test.step("displays tag badges", async () => {
    await expect(recipeList.recipeTagBadges(0)).toHaveCount(2);
    await expect(recipeList.recipeTagBadges(1)).toHaveCount(0);
    await expect(recipeList.recipeTagBadges(2)).toHaveCount(3);
  });
});

test("recipe list — error state", async ({ page }) => {
  await page.route("**/api/items*", (route) =>
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
  await page.route("**/api/items*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockItems),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step("clicking a card navigates to recipe detail", async () => {
    await recipeList.recipeCards.first().click();
    await expect(page).toHaveURL(/\/recipes\/pasta/);
  });
});
