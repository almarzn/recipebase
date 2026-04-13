# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend/e2e/recipes/recipe-edit.spec.ts >> recipe edit nav — displays recipe title for single variant recipe
- Location: frontend/e2e/recipes/recipe-edit.spec.ts:201:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/recipes/simple-salad/edit/info", waiting until "load"

```

# Test source

```ts
  1  | import type { Locator, Page } from "@playwright/test";
  2  | 
  3  | export class RecipeEditPage {
  4  |   readonly nav: Locator;
  5  |   readonly infoLink: Locator;
  6  |   readonly recipeTitle: Locator;
  7  |   readonly variantSelect: Locator;
  8  |   readonly shellContent: Locator;
  9  | 
  10 |   constructor(private readonly page: Page) {
  11 |     this.nav = page.getByTestId("recipe-edit-nav");
  12 |     this.infoLink = page.getByTestId("recipe-edit-info-link");
  13 |     this.recipeTitle = page.getByTestId("recipe-edit-title");
  14 |     this.variantSelect = page.getByTestId("recipe-edit-variant-select");
  15 |     this.shellContent = page.getByTestId("recipe-edit-shell-content");
  16 |   }
  17 | 
  18 |   async goto(slug: string, subRoute: string = "info") {
> 19 |     await this.page.goto(`/recipes/${slug}/edit/${subRoute}`);
     |                     ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  20 |   }
  21 | 
  22 |   variantOption(slug: string): Locator {
  23 |     return this.page.getByTestId(`variant-option-${slug}`);
  24 |   }
  25 | 
  26 |   async selectVariant(slug: string) {
  27 |     await this.variantSelect.click();
  28 |     await this.variantOption(slug).click();
  29 |   }
  30 | }
  31 | 
```