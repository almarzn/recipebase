import { Injectable, linkedSignal, signal } from "@angular/core";
import { applyEach, form, validate } from "@angular/forms/signals";
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
    if (this.ingredientsForm().invalid()) return;

    const parsedSteps: ParsedStep[] = this.stepModel().map((s, i) => ({
      id: s.id,
      body: s.body,
      stepOrder: i,
    }));

    console.log("Saving component:", this.component()?.id, {
      ingredients: this.ingredientModel(),
      steps: parsedSteps,
    });
  }
}
