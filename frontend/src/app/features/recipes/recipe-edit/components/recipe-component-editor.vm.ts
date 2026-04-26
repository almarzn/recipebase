import { Injectable, linkedSignal, signal } from "@angular/core";
import { form } from "@angular/forms/signals";
import type { ComponentResource, Quantity } from "@/shared/server";
import { formatQuantity, parseQuantity } from "@/shared/utils/unit";

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

@Injectable()
export class RecipeComponentEditorViewModel {
  readonly component = signal<ComponentResource | null>(null);

  readonly ingredientModel = linkedSignal<EditableIngredient[]>(() =>
    (this.component()?.ingredients ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      quantity: formatQuantity(i.quantity, { unitDisplay: "short" }),
      notes: i.notes ?? "",
    })),
  );

  readonly ingredientsForm = form(this.ingredientModel);

  readonly parseErrors = signal<Map<number, string>>(new Map());

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
    this.parseErrors.update((errors) => {
      const next = new Map(errors);
      next.delete(index);
      return next;
    });
  }

  readonly stepModel = linkedSignal<EditableStep[]>(() =>
    (this.component()?.steps ?? []).map((s) => ({
      id: s.id,
      body: s.body,
    })),
  );

  readonly stepsForm = form(this.stepModel);

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

  saveChanges(): void {
    const errors = new Map<number, string>();
    const parsedIngredients: ParsedIngredient[] = [];

    for (let i = 0; i < this.ingredientModel().length; i++) {
      const e = this.ingredientModel()[i];
      try {
        const quantity = parseQuantity(e.quantity);
        parsedIngredients.push({
          id: e.id,
          name: e.name,
          quantity,
          notes: e.notes || null,
        });
      } catch (err) {
        errors.set(i, err instanceof Error ? err.message : "Invalid quantity");
      }
    }

    this.parseErrors.set(errors);
    if (errors.size > 0) return;

    const parsedSteps: ParsedStep[] = this.stepModel().map((s, i) => ({
      id: s.id,
      body: s.body,
      stepOrder: i,
    }));

    // TODO: POST /api/recipes/{slug}/components/{componentId}
    console.log("Saving component:", this.component()?.id, {
      ingredients: parsedIngredients,
      steps: parsedSteps,
    });
  }
}
