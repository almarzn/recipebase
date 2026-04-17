import type { Locator, Page } from "@playwright/test";

export class VariantComponentsPage {
  readonly pageHeading: Locator;
  readonly variantName: Locator;
  readonly componentsDescription: Locator;
  readonly componentsList: Locator;
  readonly componentDetailPage: Locator;
  readonly componentTitle: Locator;
  readonly componentBackButton: Locator;
  readonly componentPlaceholder: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading = page.getByTestId("components-heading");
    this.variantName = page.getByTestId("variant-name");
    this.componentsDescription = page.getByTestId("components-description");
    this.componentsList = page.getByTestId("components-list");
    this.componentDetailPage = page.getByTestId("component-detail-page");
    this.componentTitle = page.getByTestId("component-title");
    this.componentBackButton = page.getByTestId("component-back-button");
    this.componentPlaceholder = page.getByTestId("component-placeholder");
  }

  componentCard(componentId: string): Locator {
    return this.page.getByTestId(`component-card-${componentId}`);
  }

  async clickComponentCard(componentId: string) {
    await this.componentCard(componentId).click();
  }

  async clickBackButton() {
    await this.componentBackButton.click();
  }
}
