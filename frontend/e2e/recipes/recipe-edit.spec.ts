import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeEditPage } from "./recipe-edit.po";

const mockRecipe = {
  id: "1",
  slug: "pasta",
  name: "Fresh Pasta",
  tags: ["italian"],
  source: { type: "original" },
  yield: { quantity: 4, unit: "servings", description: null },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  notes: null,
  components: [
    {
      id: "comp-1",
      slug: "dough",
      name: "Dough",
      position: 1,
      ingredients: [],
      steps: [],
    },
  ],
} as Recipe;

test("recipe edit nav — renders navigation sidebar", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipe),
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

  await test.step("shows components link", async () => {
    await expect(editPage.componentsLink).toBeVisible();
  });
});

test("recipe edit nav — displays recipe title", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipe),
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
      body: JSON.stringify(mockRecipe),
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
      body: JSON.stringify(mockRecipe),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "components");

  await test.step("navigates to info route when clicked", async () => {
    await editPage.infoLink.click();
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/info/);
  });
});

test("recipe edit nav — components link navigates to components route", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipe),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  await test.step("navigates to components route when clicked", async () => {
    await editPage.componentsLink.click();
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/components/);
  });
});

test("recipe edit info — saves recipe info successfully", async ({ page }) => {
  let patchRequestData: unknown = null;

  await page.route("**/api/recipes/pasta", async (route) => {
    if (route.request().method() === "PATCH") {
      patchRequestData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mockRecipe,
          name: "Updated Pasta Title",
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      });
    }
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  await test.step("updates title", async () => {
    const titleInput = page.getByLabel("Title");
    await titleInput.fill("Updated Pasta Title");
  });

  await test.step("clicks save button and PATCH request is made", async () => {
    const savePromise = page.waitForRequest(
      (req) => req.method() === "PATCH" && req.url().includes("/api/recipes/pasta"),
    );
    await page.getByRole("button", { name: "Save" }).click();
    await savePromise;

    expect(patchRequestData).toEqual({
      name: "Updated Pasta Title",
    });
  });
});

test("recipe edit info — shows loading state while saving", async ({ page }) => {
  let resolvePatch: (value: unknown) => void;
  const patchPromise = new Promise((resolve) => {
    resolvePatch = resolve;
  });

  await page.route("**/api/recipes/pasta", async (route) => {
    if (route.request().method() === "PATCH") {
      await patchPromise;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      });
    }
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  const titleInput = page.getByLabel("Title");
  await titleInput.fill("Updated Title");

  const saveButton = page.getByRole("button", { name: "Save" });

  await test.step("save button shows loading state when clicked", async () => {
    const clickPromise = saveButton.click();
    await page.waitForTimeout(50);
    await expect(saveButton).toBeDisabled();
    resolvePatch?.(undefined);
    await clickPromise;
  });
});

test("recipe edit info — shows error on save failure", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    if (route.request().method() === "PATCH") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Server error occurred" }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipe),
      });
    }
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  const titleInput = page.getByLabel("Title");
  await titleInput.fill("Updated Title");

  const saveButton = page.getByRole("button", { name: "Save" });
  await saveButton.click();

  await test.step("shows error message", async () => {
    await expect(page.locator("z-alert")).toBeVisible();
  });
});

test("recipe edit info — save button enables after changes", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipe),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  await page.waitForSelector("input#recipe-title");

  await test.step("save button is enabled after making changes", async () => {
    const saveButton = page.getByRole("button", { name: "Save" });
    const titleInput = page.getByLabel("Title");
    await titleInput.fill("Updated Title");
    await expect(saveButton).toBeEnabled();
  });
});

test("recipe edit components — displays components page", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipe),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "components");

  await test.step("shows recipe name in heading", async () => {
    await expect(editPage.recipeName).toBeVisible();
    await expect(editPage.recipeName).toHaveText("Fresh Pasta");
  });

  await test.step("shows components heading", async () => {
    await expect(editPage.componentsHeading).toBeVisible();
    await expect(editPage.componentsHeading).toHaveText("Components");
  });
});
