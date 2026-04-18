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

test("recipe edit info — saves recipe info successfully", async ({ page }) => {
  let patchRequestData: unknown = null;

  await page.route("**/api/recipes/pasta", async (route) => {
    if (route.request().method() === "PATCH") {
      patchRequestData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mockRecipeWithVariants,
          title: "Updated Pasta Title",
          description: "Updated description",
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipeWithVariants),
      });
    }
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  await test.step("updates title and description", async () => {
    const titleInput = page.getByLabel("Title");
    const descriptionInput = page.getByLabel("Description");

    await titleInput.fill("Updated Pasta Title");
    await descriptionInput.fill("Updated description");
  });

  await test.step("clicks save button and PATCH request is made", async () => {
    const savePromise = page.waitForRequest(
      (req) => req.method() === "PATCH" && req.url().includes("/api/recipes/pasta"),
    );
    await page.getByRole("button", { name: "Save" }).click();
    await savePromise;

    expect(patchRequestData).toEqual({
      title: "Updated Pasta Title",
      description: "Updated description",
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
        body: JSON.stringify(mockRecipeWithVariants),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRecipeWithVariants),
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
    // Wait a bit for the loading state to be applied
    await page.waitForTimeout(50);
    // The button should be disabled during submission
    await expect(saveButton).toBeDisabled();
    // Resolve the patch request to complete the test
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
        body: JSON.stringify(mockRecipeWithVariants),
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
    // Error should be displayed in an alert - check for z-alert element
    await expect(page.locator("z-alert")).toBeVisible();
  });
});

test("recipe edit info — save button enables after changes", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "info");

  // Wait for the recipe to load and form to initialize
  await page.waitForSelector("input#recipe-title");

  await test.step("save button is enabled after making changes", async () => {
    const saveButton = page.getByRole("button", { name: "Save" });
    const titleInput = page.getByLabel("Title");

    // Initially the button may or may not be disabled depending on form state
    // Make a change
    await titleInput.fill("Updated Title");

    // Now the button should definitely be enabled
    await expect(saveButton).toBeEnabled();
  });
});

test("recipe edit variant — displays variant name in heading", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  await test.step("shows variant name in h1", async () => {
    await expect(editPage.variantName).toBeVisible();
    await expect(editPage.variantName).toHaveText("Classic");
    await expect(editPage.variantHeading).toBeVisible();
    await expect(editPage.variantHeading).toHaveText("Basic informations");
  });
});

test("recipe edit variant — displays form with variant data", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    }),
  );

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  await test.step("shows name input with variant name", async () => {
    const nameInput = page.getByLabel("Name");
    await expect(nameInput).toHaveValue("Classic");
  });

  await test.step("shows description textarea with variant description", async () => {
    const descriptionInput = page.getByLabel("Description");
    await expect(descriptionInput).toHaveValue("Traditional egg pasta recipe");
  });
});

test("recipe edit variant — saves variant info successfully", async ({ page }) => {
  let putRequestData: unknown = null;

  await page.route("**/api/recipes/pasta/variants/classic", async (route) => {
    if (route.request().method() === "PUT") {
      putRequestData = route.request().postDataJSON();
      await route.fulfill({
        status: 204,
      });
    } else {
      await route.fulfill({
        status: 404,
      });
    }
  });

  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...mockRecipeWithVariants,
        variants: [
          {
            ...mockRecipeWithVariants.variants[0],
            name: "Updated Classic Name",
            description: "Updated variant description",
          },
          mockRecipeWithVariants.variants[1],
        ],
      }),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  await test.step("updates name and description", async () => {
    const nameInput = page.getByLabel("Name");
    const descriptionInput = page.getByLabel("Description");

    await nameInput.fill("Updated Classic Name");
    await descriptionInput.fill("Updated variant description");
  });

  await test.step("clicks save button and PUT request is made", async () => {
    const savePromise = page.waitForRequest(
      (req) => req.method() === "PUT" && req.url().includes("/api/recipes/pasta/variants/classic"),
    );
    await page.getByRole("button", { name: "Save" }).click();
    await savePromise;

    expect(putRequestData).toEqual({
      name: "Updated Classic Name",
      description: "Updated variant description",
    });
  });
});

test("recipe edit variant — shows loading state while saving", async ({ page }) => {
  let resolvePut: (value: unknown) => void;
  const putPromise = new Promise((resolve) => {
    resolvePut = resolve;
  });

  await page.route("**/api/recipes/pasta/variants/classic", async (route) => {
    if (route.request().method() === "PUT") {
      await putPromise;
      await route.fulfill({
        status: 204,
      });
    } else {
      await route.fulfill({
        status: 404,
      });
    }
  });

  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  const nameInput = page.getByLabel("Name");
  await nameInput.fill("Updated Name");

  const saveButton = page.getByRole("button", { name: "Save" });

  await test.step("save button shows loading state when clicked", async () => {
    const clickPromise = saveButton.click();
    // Wait a bit for the loading state to be applied
    await page.waitForTimeout(50);
    // The button should be disabled during submission
    await expect(saveButton).toBeDisabled();
    // Resolve the put request to complete the test
    resolvePut?.(undefined);
    await clickPromise;
  });
});

test("recipe edit variant — shows error on save failure", async ({ page }) => {
  await page.route("**/api/recipes/pasta/variants/classic", async (route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Server error occurred" }),
      });
    } else {
      await route.fulfill({
        status: 404,
      });
    }
  });

  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  const nameInput = page.getByLabel("Name");
  await nameInput.fill("Updated Name");

  const saveButton = page.getByRole("button", { name: "Save" });
  await saveButton.click();

  await test.step("shows error message", async () => {
    // Error should be displayed in an alert - check for z-alert element
    await expect(page.locator("z-alert")).toBeVisible();
  });
});

test("recipe edit variant — save button enables after changes", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  // Wait for the form to initialize
  await page.waitForSelector("input#variant-name");

  await test.step("save button is enabled after making changes", async () => {
    const saveButton = page.getByRole("button", { name: "Save" });
    const nameInput = page.getByLabel("Name");

    // Make a change
    await nameInput.fill("Updated Variant Name");

    // Now the button should definitely be enabled
    await expect(saveButton).toBeEnabled();
  });
});

test("recipe edit variant — validation shows error for empty name", async ({ page }) => {
  await page.route("**/api/recipes/pasta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithVariants),
    });
  });

  const editPage = new RecipeEditPage(page);
  await editPage.goto("pasta", "variants/classic");

  // Wait for the form to initialize
  await page.waitForSelector("input#variant-name");

  await test.step("shows validation error when name is cleared and field is touched", async () => {
    const nameInput = page.getByLabel("Name");

    // Clear the name field
    await nameInput.fill("");

    // Blur the field to trigger validation
    await nameInput.blur();

    // Error message should be visible
    await expect(page.getByText("Name is required")).toBeVisible();
  });
});
