import { HttpClient } from "@angular/common/http";
import { computed, Injectable, inject, linkedSignal, signal } from "@angular/core";
import { form, required } from "@angular/forms/signals";
import { firstValueFrom } from "rxjs";
import { RecipeEditViewModel } from "./recipe-edit.vm";

export interface VariantFormData {
  name: string;
  description: string;
}

export interface UpdateVariantBasicRequest {
  name: string;
  description: string | null;
}

@Injectable()
export class RecipeVariantEditViewModel {
  readonly parentVm = inject(RecipeEditViewModel);
  readonly variant = this.parentVm.activeVariant;
  private readonly http = inject(HttpClient);

  // linkedSignal that saves state but re-initializes when variant changes
  readonly variantInfo = linkedSignal<VariantFormData>(() => {
    const v = this.variant();

    return {
      name: v?.name ?? "",
      description: v?.description ?? "",
    };
  });

  // Signal form with validation schema - uses linkedSignal as model
  readonly form = form(
    this.variantInfo,
    (schemaPath) => {
      required(schemaPath.name, { message: "Name is required" });
    },
    {
      submission: {
        action: async () => this.submit(),
      },
    },
  );

  // Expose field trees for template binding
  readonly nameField = this.form.name;
  readonly descriptionField = this.form.description;

  // Computed to check if form has changes from original variant
  readonly hasChanges = computed(() => {
    const v = this.variant();
    if (!v) return false;
    const current = this.variantInfo();
    return current.name !== v.name || current.description !== (v.description ?? "");
  });

  // Expose current form data
  readonly formData = computed(() => this.variantInfo());

  // Submit state
  private readonly submittingSignal = signal(false);
  private readonly submitErrorSignal = signal<string | null>(null);

  readonly submitting = this.submittingSignal.asReadonly();
  readonly submitError = this.submitErrorSignal.asReadonly();

  reset(): void {
    // Reset to original variant values
    const v = this.variant();
    this.variantInfo.set({
      name: v?.name ?? "",
      description: v?.description ?? "",
    });
    this.form().reset();
  }

  async submit(): Promise<void> {
    const slug = this.parentVm.slug();
    const variantSlug = this.parentVm.variantSlug();
    if (!slug || !variantSlug) {
      this.submitErrorSignal.set("Recipe or variant slug is missing");
      return;
    }

    this.submittingSignal.set(true);
    this.submitErrorSignal.set(null);

    try {
      const formData = this.variantInfo();
      const request: UpdateVariantBasicRequest = {
        name: formData.name,
        description: formData.description || null,
      };

      await firstValueFrom(this.http.put<void>(`/api/recipes/${slug}/variants/${variantSlug}`, request));

      // Reload recipe data to get updated timestamps and sync state
      this.parentVm.detailVm.reload();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save variant";
      this.submitErrorSignal.set(message);
      throw e; // Re-throw so the form knows submission failed
    } finally {
      this.submittingSignal.set(false);
    }
  }
}
