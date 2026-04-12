import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeEditPage } from "./recipe-edit.po";

const mockRecipeWithVariants: Recipe = {
  id: "1",
  slug: "pasta",
  title: "Fresh Pasta",
  description: "Handmade pasta with semolina flour and eggs",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  variants: [
    {
      slug: "classic",
      name: "Classic",
      description: "Traditional egg pasta recipe",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [
        {
          id: "comp-1",
          title: "Dough",
          description: "The pasta dough base",
          link: { quality: "self" },
          ingredients: [],
          steps: [],
        },
      ],
    },
    {
      slug: "spinach",
      name: "Spinach",
      description: "Green pasta with spinach",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [],
    },
  ],
};

const mockRecipeSingleVariant: Recipe = {
  id: "2",
  slug: "simple-salad",
  title: "Simple Salad",
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  variants: [
    {
      slug: "basic",
      name: "Basic",
      description: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [],
    },
  ],
};

test("recipe edit nav — renders navigation sidebar", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta");

  await test.step("shows navigation sidebar", async () => {
    await expect(editPage.nav).toBeVisible();
  });

  await test.step("shows info link", async () => {
    await expect(editPage.infoLink).toBeVisible();
  });

  await test.step("shows variant selector", async () => {
    await expect(editPage.variantSelect).toBeVisible();
  });
});

test("recipe edit nav — displays recipe title", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta");

  await test.step("displays recipe title in navigation", async () => {
    await expect(editPage.recipeTitle).toHaveText("Fresh Pasta");
  });
});

test("recipe edit nav — displays recipe title placeholder when not loaded", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta");

  await test.step("shows placeholder title while loading", async () => {
    await expect(editPage.recipeTitle).toHaveText("Recipe Title");
  });
});

test("recipe edit nav — info link navigates to info route", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  await test.step("navigates to info route when clicked", async () => {
    await editPage.infoLink.click();
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/info/);
  });
});

test("recipe edit nav — variant selector shows all variants", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta");

  await test.step("opens variant selector", async () => {
    await editPage.variantSelect.click();
  });

  await test.step("shows all variant options", async () => {
    await expect(editPage.variantOption("classic")).toBeVisible();
    await expect(editPage.variantOption("spinach")).toBeVisible();
  });

  await test.step("displays correct variant names", async () => {
    await expect(editPage.variantOption("classic")).toHaveText("Classic");
    await expect(editPage.variantOption("spinach")).toHaveText("Spinach");
  });
});

test("recipe edit nav — selecting variant navigates to variant route", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta");

  await test.step("navigates to variant route when variant selected", async () => {
    await editPage.selectVariant("spinach");
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/spinach/);
  });
});

test("recipe edit nav — variant selector reflects current route", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  await test.step("variant selector shows current variant", async () => {
    await editPage.variantSelect.click();
    await expect(editPage.variantOption("classic")).toBeVisible();
  });
});

test("recipe edit nav — displays recipe title for single variant recipe", async ({ page }) => {
  await page.route("**/api/recipes/simple-salad", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeSingleVariant),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("simple-salad");

  await test.step("displays correct recipe title", async () => {
    await expect(editPage.recipeTitle).toHaveText("Simple Salad");
  });
});

test("recipe edit nav — navigating between variants updates url", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  await test.step("starts on classic variant", async () => {
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/classic/);
  });

  await test.step("switches to spinach variant", async () => {
    await editPage.selectVariant("spinach");
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/spinach/);
  });

  await test.step("switches back to classic variant", async () => {
    await editPage.selectVariant("classic");
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/classic/);
  });
});
