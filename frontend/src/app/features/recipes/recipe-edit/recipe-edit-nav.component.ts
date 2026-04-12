import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { RecipeEditViewModel } from "./recipe-edit.vm";

@Component({
  selector: "app-recipe-edit-nav",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav>
      <ul>
        <li>
          <a routerLink="info">Info</a>
        </li>
        @for (variant of vm.variants(); track variant.slug) {
          <li>
            <a [routerLink]="['variants', variant.slug]">{{ variant.name }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class RecipeEditNavComponent {
  protected readonly vm = inject(RecipeEditViewModel);
}
