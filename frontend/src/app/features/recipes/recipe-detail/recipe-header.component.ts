import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { type SegmentedOption, ZardSegmentedComponent } from "@/shared/components/segmented";
import { RecipeVariantViewModel } from "./recipe-variant.vm";

@Component({
  selector: "app-recipe-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardSegmentedComponent],
  template: `
    <div data-testid="recipe-header" class="flex">
      <div class="flex flex-col gap-6 grow">
        <!-- Title Section -->
        <div class="flex flex-col gap-2">
          <h1 data-testid="recipe-title" class="font-serif text-4xl text-teal-800 leading-tight">
            {{ recipe()!.title }}
          </h1>
          @if (recipe()!.description) {
            <p data-testid="recipe-description" class="font-sans text-lg text-gray-700 leading-relaxed max-w-prose">
              {{ recipe()!.description }}
            </p>
          }
        </div>

      </div>
      @if (recipe()!.variants.length > 0) {
        <div data-testid="recipe-variant-selector" class="flex flex-col gap-3 items-end">
          <div class="flex flex-wrap gap-2">
            <z-segmented
              data-testid="variant-segmented-control"
              [zOptions]="variantOptions()"
              [value]="variantSlug()"
              (valueChange)="setActiveVariant($event)"
            />
          </div>
          @if (activeVariant(); as variant) {
            @if (variant.description) {
              <div data-testid="variant-description" class="flex flex-col gap-2 rounded-md text-sm">
                <p class="font-sans text-gray-700 leading-relaxed">
                  {{ variant.description }}
                </p>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class RecipeHeaderComponent {
  private readonly variantVm = inject(RecipeVariantViewModel);

  readonly recipe = this.variantVm.parentVm.recipe;
  readonly activeVariant = this.variantVm.activeVariant;

  readonly variantSlug = computed(() => this.variantVm.variantSlug() ?? undefined);

  setActiveVariant(slug: string | undefined): void {
    if (slug === undefined) {
      return;
    }
    this.variantVm.variantSlug.set(slug);
  }

  protected readonly variantOptions = computed<SegmentedOption[]>(
    () => this.recipe()?.variants?.map((v) => ({ value: v.slug, label: v.name })) ?? [],
  );
}
