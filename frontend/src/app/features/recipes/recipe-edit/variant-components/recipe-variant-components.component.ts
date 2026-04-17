import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCarrot, lucideChevronRight, lucideLayers, lucideListOrdered } from "@ng-icons/lucide";
import { formatQuantity } from "@/shared/utils";
import { RecipeEditViewModel } from "../recipe-edit.vm";
import { RecipeVariantComponentsViewModel } from "./recipe-variant-components.vm";

@Component({
  selector: "app-recipe-variant-components",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecipeVariantComponentsViewModel],
  imports: [NgIcon, RouterLink],
  template: `
		<div class="flex flex-col gap-6" data-testid="variant-components-page">
			<div>
				<h2 class="font-bold text-teal-600 flex flex-col gap-2 text-lg" data-testid="variant-name">{{ vm.variant()?.name }}</h2>
				<h1 class="font-serif text-4xl" data-testid="components-heading">Components</h1>
			</div>
			<p class="text-sm text-stone-500" data-testid="components-description">
				Manage the components for this variant. Components group ingredients and steps together.
			</p>

			@if (vm.hasComponents()) {
				<div class="flex flex-col gap-8" data-testid="components-list">
					@for (component of vm.components(); track component.id) {
						<a
							[routerLink]="['/recipes', parentVm.slug(), 'edit', 'components', component.id]"
							class="block cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-stone-200/50 group relative bg-white rounded-lg border border-stone-200 p-6 no-underline"
							[attr.data-testid]="'component-card-' + component.id"
						>
							<h3 class="font-serif text-2xl text-stone-800 mb-4">{{ component.title }}</h3>
							<div class="grid grid-cols-2 gap-6 pr-8">
									<!-- Right arrow indicator - appears on hover -->
									<div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
										<ng-icon name="lucideChevronRight" class="size-6 text-teal-600" />
									</div>
									<!-- Ingredients Column -->
									<div class="flex flex-col gap-4">
										<div class="flex items-center gap-2 text-stone-500 font-medium uppercase text-xs tracking-wider border-b border-stone-200 pb-2">
											<ng-icon name="lucideCarrot" class="size-4" />
											<span>Ingredients</span>
										</div>
										@if (component.ingredients.length > 0) {
											<ul class="flex flex-col gap-3 text-base">
												@for (ingredient of component.ingredients; track ingredient.slug) {
													<li class="flex items-start gap-2">
														<span class="text-teal-600">•</span>
														<div class="flex flex-col">
															<span class="font-medium">{{ ingredient.name }}</span>
															@if (ingredient.notes) {
																<span class="text-sm text-stone-500">{{ ingredient.notes }}</span>
															}
															<span class="text-sm text-stone-600">
															{{ formatQuantity(ingredient.quantity, {
															    unitDisplay: 'narrow'
														 }) }}
															</span>
														</div>
													</li>
												}
											</ul>
										} @else {
											<p class="text-base text-stone-400 italic">No ingredients</p>
										}
									</div>

									<!-- Steps Column -->
									<div class="flex flex-col gap-4">
										<div class="flex items-center gap-2 text-stone-500 font-medium uppercase text-xs tracking-wider border-b border-stone-200 pb-2">
											<ng-icon name="lucideListOrdered" class="size-4" />
											<span>Steps</span>
										</div>
										@if (component.steps.length > 0) {
											<ol class="flex flex-col gap-4 text-base">
												@for (step of component.steps; track step.id) {
													<li class="flex gap-2">
														<span class="text-teal-600 font-medium shrink-0">{{ $index + 1 }}.</span>
														<div class="flex flex-col">
															<span>{{ step.text }}</span>
															@if (step.notes) {
																<span class="text-sm text-stone-500">{{ step.notes }}</span>
															}
														</div>
													</li>
												}
											</ol>
										} @else {
											<p class="text-base text-stone-400 italic">No steps</p>
										}
									</div>
							</div>
						</a>
					}
				</div>
			} @else {
				<div class="flex flex-col items-center justify-center py-12 text-stone-500">
					<ng-icon name="lucideLayers" class="size-12 mb-4 opacity-50" />
					<p class="text-sm">No components yet.</p>
					<p class="text-xs">Components will be listed here once added.</p>
				</div>
			}
		</div>
	`,
  viewProviders: [
    provideIcons({
      lucideLayers,
      lucideCarrot,
      lucideListOrdered,
      lucideChevronRight,
    }),
  ],
})
export class RecipeVariantComponentsComponent {
  protected readonly vm = inject(RecipeVariantComponentsViewModel);
  protected readonly parentVm = inject(RecipeEditViewModel);

  readonly formatQuantity = formatQuantity;
}
