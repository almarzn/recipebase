import { HttpClient, type HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, linkedSignal, signal } from "@angular/core";
import { applyEach, form, validate } from "@angular/forms/signals";
import { firstValueFrom } from "rxjs";
import type { ComponentResource, Quantity } from "@/shared/server";
import { formatQuantityForEdit, parseQuantity } from "@/shared/utils/unit";
import { RecipeEditViewModel } from "../recipe-edit.vm";

export interface EditableIngredient {
  id: string;
  name: string;
  quantity: string;
  notes: string;
}

export interface EditableStep {
  id: string;
  body: string;
}

export interface ParsedIngredient {
  id: string;
  name: string;
  quantity: Quantity;
  notes: string | null;
}

export interface ParsedStep {
  id: string;
  body: string;
  stepOrder: number;
}

interface ReplaceComponentRequest {
  name: string | null;
  ingredients: Array<{
    slug: string;
    name: string;
    quantity: Quantity;
    notes: string | null;
  }>;
  steps: Array<{
    body: string;
    timer: string | null;
  }>;
}

@Injectable()
export class RecipeComponentEditorViewModel {
  private readonly parentVm = inject(RecipeEditViewModel);
  private readonly http = inject(HttpClient);

  readonly component = signal<ComponentResource | null>(null);

  readonly ingredientModel = linkedSignal<EditableIngredient[]>(() =>
    (this.component()?.ingredients ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      quantity: formatQuantityForEdit(i.quantity),
      notes: i.notes ?? "",
    })),
  );

  readonly ingredientsForm = form(this.ingredientModel, (path) => {
    applyEach(path, (item) => {
      validate(item.quantity, ({ value }) => {
        const text = value();
        try {
          parseQuantity(text);
          return null;
        } catch (err) {
          return {
            kind: "quantity",
            message: err instanceof Error ? err.message : "Invalid quantity",
          };
        }
      });
    });
  });

  addIngredient(): void {
    const newItem: EditableIngredient = {
      id: `temp-${Date.now()}`,
      name: "",
      quantity: "",
      notes: "",
    };
    this.ingredientModel.update((curr) => [...curr, newItem]);
  }

  deleteIngredient(index: number): void {
    this.ingredientModel.update((curr) => curr.filter((_, i) => i !== index));
  }

  moveIngredientUp(index: number): void {
    if (index <= 0) return;
    this.ingredientModel.update((curr) => {
      const arr = [...curr];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }

  moveIngredientDown(index: number): void {
    this.ingredientModel.update((curr) => {
      if (index >= curr.length - 1) return curr;
      const arr = [...curr];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }

  readonly stepModel = linkedSignal<EditableStep[]>(() =>
    (this.component()?.steps ?? []).map((s) => ({
      id: s.id,
      body: s.body,
    })),
  );

  readonly stepsForm = form(this.stepModel);

  private readonly submittingSignal = signal(false);
  private readonly submitErrorSignal = signal<string | null>(null);

  readonly submitting = this.submittingSignal.asReadonly();
  readonly submitError = this.submitErrorSignal.asReadonly();

  addStep(): void {
    const newItem: EditableStep = {
      id: `temp-${Date.now()}`,
      body: "",
    };
    this.stepModel.update((curr) => [...curr, newItem]);
  }

  deleteStep(index: number): void {
    this.stepModel.update((curr) => curr.filter((_, i) => i !== index));
  }

  async saveChanges(): Promise<void> {
    if (this.ingredientsForm().invalid()) return;

    const comp = this.component();
    const recipeSlug = this.parentVm.slug();
    if (!comp || !recipeSlug) return;

    this.submittingSignal.set(true);
    this.submitErrorSignal.set(null);

    try {
      const ingredients = this.ingredientModel().map((ei, i) => {
        const orig = comp.ingredients.find((ing) => ing.id === ei.id);
        const slug = orig?.slug ?? this.slugifyName(ei.name) ?? `ingredient-${i}`;
        const quantity = parseQuantity(ei.quantity);

        return {
          slug,
          name: ei.name,
          quantity,
          notes: ei.notes || null,
        };
      });

      const steps = this.stepModel().map((es) => ({
        body: es.body,
        timer: null,
      }));

      const request: ReplaceComponentRequest = {
        name: comp.name,
        ingredients,
        steps,
      };

      await firstValueFrom(this.http.put(`/api/recipes/${recipeSlug}/components/${comp.slug}`, request));

      this.parentVm.detailVm.reload();
    } catch (e) {
      this.submitErrorSignal.set(this.extractError(e));
    } finally {
      this.submittingSignal.set(false);
    }
  }

  private slugifyName(name: string): string | null {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || null;
  }

  private extractError(e: unknown): string {
    const httpErr = e as HttpErrorResponse;
    if (httpErr?.error?.message) {
      return httpErr.error.message;
    }
    if (e instanceof Error) {
      return e.message;
    }
    return "Failed to save component";
  }
}
