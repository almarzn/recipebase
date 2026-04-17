import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";

@Component({
  selector: "app-recipe-component-detail",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardButtonComponent],
  template: `
		<div class="flex flex-col gap-6" data-testid="component-detail-page">
			<div class="flex items-center gap-2">
				<button z-button zType="link" (click)="goBack()" data-testid="component-back-button">
					<ng-icon name="lucideArrowLeft" class="size-4 mr-1" />
					Back
				</button>
			</div>

			<div>
				<h2 class="font-bold text-teal-600 flex flex-col gap-2 text-lg" data-testid="component-label">Component</h2>
				<h1 class="font-serif text-4xl" data-testid="component-title">{{ componentId() }}</h1>
			</div>

			<p class="text-sm text-stone-500" data-testid="component-placeholder">Component detail page - coming soon.</p>
		</div>
	`,
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
    }),
  ],
})
export class RecipeComponentDetailComponent {
  private readonly location = inject(Location);

  // For now, just display the ID from the URL. In the future, this will be fetched from a view model
  protected componentId(): string {
    const path = this.location.path();
    const segments = path.split("/");
    return segments[segments.length - 1] ?? "unknown";
  }

  protected goBack(): void {
    // Use browser back to return to the components list
    this.location.back();
  }
}
