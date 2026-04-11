import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeDetailPage } from "./recipe-detail.po";

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
          ingredients: [
            {
              slug: "semolina",
              name: "Semolina flour",
              notes: "Fine grind preferred",
              quantity: { unit: "gram", amount: 300 },
            },
            {
              slug: "eggs",
              name: "Large eggs",
              notes: null,
              quantity: { unit: "unspecified", notes: "3 whole" },
            },
          ],
          steps: [
            {
              id: "step-1",
              text: "Mix flour and eggs in a large bowl",
              notes: "Use a fork to start, then hands",
              attachment: null,
            },
            {
              id: "step-2",
              text: "Knead for 10 minutes until smooth",
              notes: null,
              attachment: { duration: "PT10M" },
            },
          ],
        },
      ],
    },
    {
      slug: "spinach",
      name: "Spinach",
      description: "Green pasta with spinach",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [
        {
          id: "comp-2",
          title: "Spinach Dough",
          description: null,
          link: { quality: "self" },
          ingredients: [
            {
              slug: "semolina",
              name: "Semolina flour",
              notes: null,
              quantity: { unit: "gram", amount: 300 },
            },
            {
              slug: "spinach",
              name: "Fresh spinach",
              notes: "Blanched and squeezed dry",
              quantity: { unit: "gram", amount: 100 },
            },
          ],
          steps: [
            {
              id: "step-3",
              text: "Blend spinach with eggs",
              notes: null,
              attachment: null,
            },
          ],
        },
      ],
    },
  ],
};

const mockRecipeMinimal: Recipe = {
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
      components: [
        {
          id: "comp-3",
          title: "Base",
          description: null,
          link: { quality: "self" },
          ingredients: [],
          steps: [],
        },
      ],
    },
  ],
};

const mockRecipeMultiComponent: Recipe = {
  id: "3",
  slug: "lasagna",
  title: "Lasagna",
  description: "Classic Italian layered pasta dish",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  variants: [
    {
      slug: "meat",
      name: "Meat",
      description: "Traditional meat lasagna",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [
        {
          id: "comp-4",
          title: "Ragu",
          description: "Meat sauce",
          link: { quality: "self" },
          ingredients: [
            {
              slug: "beef",
              name: "Ground beef",
              notes: null,
              quantity: { unit: "gram", amount: 500 },
            },
          ],
          steps: [
            {
              id: "step-4",
              text: "Brown the beef",
              notes: null,
              attachment: null,
            },
          ],
        },
        {
          id: "comp-5",
          title: "Bechamel",
          description: "White sauce",
          link: { quality: "self" },
          ingredients: [
            {
              slug: "milk",
              name: "Whole milk",
              notes: null,
              quantity: { unit: "liter", amount: 1 },
            },
          ],
          steps: [
            {
              id: "step-5",
              text: "Make the bechamel",
              notes: null,
              attachment: null,
            },
          ],
        },
      ],
    },
  ],
};

test("recipe detail — loading state", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
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
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("pasta");

  await test.step("shows recipe header with title and description", async () => {
    await expect(detail.header).toBeVisible();
    await expect(detail.title).toHaveText("Fresh Pasta");
    await expect(detail.description).toHaveText("Handmade pasta with semolina flour and eggs");
  });

  await test.step("shows variant selector with options", async () => {
    await expect(detail.variantSelector).toBeVisible();
    await expect(detail.variantSegmentedControl).toBeVisible();
  });

  await test.step("shows variant description for default variant", async () => {
    await expect(detail.variantDescription).toBeVisible();
    await expect(detail.variantDescription).toContainText("Traditional egg pasta recipe");
  });

  await test.step("shows ingredient list with correct structure", async () => {
    await expect(detail.ingredientListCard).toBeVisible();
    await expect(detail.ingredientsHeading).toHaveText("Ingredients");
    await expect(detail.ingredientsContent).toBeVisible();
  });

  await test.step("displays component title in ingredients", async () => {
    await expect(detail.componentTitle(0)).toHaveText("Dough");
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

  await test.step("displays step text", async () => {
    await expect(detail.stepText(0)).toHaveText("Mix flour and eggs in a large bowl");
    await expect(detail.stepText(1)).toHaveText("Knead for 10 minutes until smooth");
  });

  await test.step("displays step notes when present", async () => {
    await expect(detail.stepNotes(0)).toHaveText("Use a fork to start, then hands");
  });

  await test.step("displays timer attachments", async () => {
    await expect(detail.stepTimer(1)).toBeVisible();
    await expect(detail.stepTimer(1)).toContainText("Timer:");
  });
});

test("recipe detail — switching variants updates content", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("pasta");

  await test.step("initial variant shows correct ingredients", async () => {
    await expect(detail.ingredientName(0)).toHaveText("Semolina flour");
    await expect(detail.ingredientName(1)).toHaveText("Large eggs");
  });

  await test.step("variant description updates when switching", async () => {
    // Note: variant switching happens through URL navigation in this implementation
    await detail.goto("pasta", "spinach");
    await expect(detail.variantDescription).toContainText("Green pasta with spinach");
  });

  await test.step("ingredients update for new variant", async () => {
    await expect(detail.ingredientName(0)).toHaveText("Semolina flour");
    await expect(detail.ingredientName(1)).toHaveText("Fresh spinach");
    await expect(detail.ingredientNotes(1)).toHaveText("Blanched and squeezed dry");
  });

  await test.step("steps update for new variant", async () => {
    await expect(detail.stepItems).toHaveCount(1);
    await expect(detail.stepText(0)).toHaveText("Blend spinach with eggs");
  });
});

test("recipe detail — handles recipe with no ingredients", async ({ page }) => {
  await page.route("**/api/recipes/simple-salad", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMinimal),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("simple-salad");

  await test.step("shows empty ingredients message", async () => {
    await expect(detail.ingredientsEmpty).toBeVisible();
    await expect(detail.ingredientsEmpty).toContainText("No ingredients listed for this recipe");
  });

  await test.step("does not show ingredients content", async () => {
    await expect(detail.ingredientsContent).not.toBeVisible();
  });
});

test("recipe detail — handles recipe with no steps", async ({ page }) => {
  await page.route("**/api/recipes/simple-salad", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMinimal),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("simple-salad");

  await test.step("shows empty steps message", async () => {
    await expect(detail.stepsEmpty).toBeVisible();
    await expect(detail.stepsEmpty).toContainText("No instructions listed for this recipe");
  });

  await test.step("does not show steps content", async () => {
    await expect(detail.stepsContent).not.toBeVisible();
  });
});

test("recipe detail — displays multiple components correctly", async ({ page }) => {
  await page.route("**/api/recipes/lasagna", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMultiComponent),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("lasagna");

  await test.step("shows multiple ingredient groups", async () => {
    await expect(detail.ingredientGroups).toHaveCount(2);
    await expect(detail.componentTitle(0)).toHaveText("Ragu");
    await expect(detail.componentTitle(1)).toHaveText("Bechamel");
  });

  await test.step("shows multiple step groups with component titles", async () => {
    await expect(detail.stepGroups).toHaveCount(2);
    await expect(detail.stepsComponentTitle(0)).toHaveText("Ragu");
    await expect(detail.stepsComponentTitle(1)).toHaveText("Bechamel");
  });

  await test.step("step numbers continue across components", async () => {
    await expect(detail.stepNumber(0)).toHaveText("01");
    await expect(detail.stepNumber(1)).toHaveText("02");
  });
});

test("recipe detail — handles recipe without description", async ({ page }) => {
  await page.route("**/api/recipes/simple-salad", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeMinimal),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("simple-salad");

  await test.step("shows title but no description", async () => {
    await expect(detail.title).toHaveText("Simple Salad");
    await expect(detail.description).not.toBeVisible();
  });
});
