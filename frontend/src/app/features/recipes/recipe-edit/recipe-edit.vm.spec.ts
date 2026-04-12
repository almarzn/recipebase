import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { Recipe, Variant } from "@/shared/models";
import { RecipeDetailViewModel } from "../recipe-detail/recipe-detail.vm";
import { RecipeEditViewModel } from "./recipe-edit.vm";

const mockVariant: Variant = {
  slug: "classic",
  name: "Classic",
  description: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  components: [],
};

const mockRecipe: Recipe = {
  id: "1",
  slug: "pasta",
  title: "Pasta",
  description: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  variants: [mockVariant],
};

describe("RecipeEditViewModel", () => {
  let editVm: RecipeEditViewModel;

  beforeEach(() => {
    const recipeSignal = signal<Recipe | null>(mockRecipe);
    const variantsSignal = signal<Variant[]>([mockVariant]);
    const slugSignal = signal<string | undefined>("pasta");

    TestBed.configureTestingModule({
      providers: [
        RecipeEditViewModel,
        {
          provide: RecipeDetailViewModel,
          useValue: {
            recipe: recipeSignal,
            variants: variantsSignal,
            slug: slugSignal,
          },
        },
      ],
    });

    editVm = TestBed.inject(RecipeEditViewModel);
  });

  it("exposes recipe from detail vm", () => {
    expect(editVm.recipe()).toEqual(mockRecipe);
  });

  it("exposes variants from detail vm", () => {
    expect(editVm.variants()).toEqual([mockVariant]);
  });

  it("exposes slug from detail vm", () => {
    expect(editVm.slug()).toBe("pasta");
  });
});
