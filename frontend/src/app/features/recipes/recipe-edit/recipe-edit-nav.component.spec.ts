import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { Variant } from "@/shared/models";
import { RecipeEditViewModel } from "./recipe-edit.vm";
import { RecipeEditNavComponent } from "./recipe-edit-nav.component";

const mockVariants: Variant[] = [
  { slug: "classic", name: "Classic", description: null, createdAt: "", updatedAt: "", components: [] },
  { slug: "vegan", name: "Vegan", description: null, createdAt: "", updatedAt: "", components: [] },
];

describe("RecipeEditNavComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeEditNavComponent],
      providers: [
        provideRouter([]),
        {
          provide: RecipeEditViewModel,
          useValue: {
            variants: signal(mockVariants),
            slug: signal("pasta"),
            recipe: signal(null),
          },
        },
      ],
    }).compileComponents();
  });

  it("renders Info link", () => {
    const fixture = TestBed.createComponent(RecipeEditNavComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Info");
  });

  it("renders a link per variant", () => {
    const fixture = TestBed.createComponent(RecipeEditNavComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Classic");
    expect(fixture.nativeElement.textContent).toContain("Vegan");
  });
});
