import { TestBed } from "@angular/core/testing";
import { RecipeEditVariantComponent } from "./recipe-edit-variant.component";

describe("RecipeEditVariantComponent", () => {
  it("renders without error", async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeEditVariantComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(RecipeEditVariantComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("displays edit variant text", async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeEditVariantComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(RecipeEditVariantComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Edit variant");
  });
});
