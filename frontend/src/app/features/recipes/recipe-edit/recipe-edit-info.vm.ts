import { HttpClient } from "@angular/common/http";
import { computed, Injectable, inject, linkedSignal, signal } from "@angular/core";
import { form, required } from "@angular/forms/signals";
import { firstValueFrom } from "rxjs";
import { RecipeEditViewModel } from "@/features/recipes/recipe-edit/recipe-edit.vm";
import type { Recipe } from "@/shared/models";

export interface RecipeInfoFormData {
  title: string;
  description: string;
}

export interface UpdateRecipeRequest {
  title: string;
  description: string | null;
}

@Injectable()
export class RecipeEditInfoViewModel {
  readonly parentVm = inject(RecipeEditViewModel);
  readonly recipe = this.parentVm.recipe;
  private readonly http = inject(HttpClient);

  // linkedSignal that saves state but re-initializes when recipe changes
  readonly basicRecipeInfo = linkedSignal<RecipeInfoFormData>(() => {
    const r = this.recipe();

    return {
      title: r?.title ?? "",
      description: r?.description ?? "",
    };
  });

  // Signal form with validation schema - uses linkedSignal as model
  readonly form = form(
    this.basicRecipeInfo,
    (schemaPath) => {
      required(schemaPath.title, { message: "Title is required" });
    },
    {
      submission: {
        action: async () => this.submit(),
      },
    },
  );

  // Expose field trees for template binding
  readonly titleField = this.form.title;
  readonly descriptionField = this.form.description;

  // Computed to check if form has changes from original recipe
  readonly hasChanges = computed(() => {
    const r = this.recipe();
    if (!r) return false;
    const current = this.basicRecipeInfo();
    return current.title !== r.title || current.description !== (r.description ?? "");
  });

  // Expose current form data
  readonly formData = computed(() => this.basicRecipeInfo());

  // Submit state
  private readonly submittingSignal = signal(false);
  private readonly submitErrorSignal = signal<string | null>(null);

  readonly submitting = this.submittingSignal.asReadonly();
  readonly submitError = this.submitErrorSignal.asReadonly();

  reset(): void {
    // Reset to original recipe values
    const r = this.recipe();
    this.basicRecipeInfo.set({
      title: r?.title ?? "",
      description: r?.description ?? "",
    });
    this.form().reset();
  }

  async submit(): Promise<void> {
    const slug = this.parentVm.slug();
    if (!slug) {
      this.submitErrorSignal.set("Recipe slug is missing");
      return;
    }

    this.submittingSignal.set(true);
    this.submitErrorSignal.set(null);

    try {
      const formData = this.basicRecipeInfo();
      const request: UpdateRecipeRequest = {
        title: formData.title,
        description: formData.description || null,
      };

      await firstValueFrom(this.http.patch<Recipe>(`/api/recipes/${slug}`, request));

      // Reload recipe data to get updated timestamps and sync state
      this.parentVm.detailVm.reload();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save recipe";
      this.submitErrorSignal.set(message);
      throw e; // Re-throw so the form knows submission failed
    } finally {
      this.submittingSignal.set(false);
    }
  }
}
