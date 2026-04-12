import { TestBed } from "@angular/core/testing";
import { RecipeEditInfoComponent } from "./recipe-edit-info.component";

describe("RecipeEditInfoComponent", () => {
  it("renders without error", async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeEditInfoComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(RecipeEditInfoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("displays edit info text", async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeEditInfoComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(RecipeEditInfoComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Edit info");
  });
});
