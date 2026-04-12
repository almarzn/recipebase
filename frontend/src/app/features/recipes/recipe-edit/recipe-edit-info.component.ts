import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-recipe-edit-info",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Edit info</p>`,
})
export class RecipeEditInfoComponent {}
