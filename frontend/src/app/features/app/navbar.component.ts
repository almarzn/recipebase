import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardInputGroupComponent } from "@/shared/components/input-group";

@Component({
  selector: "app-navbar",
  imports: [RouterLink, RouterLinkActive, ZardInputDirective, ZardInputGroupComponent, NgIcon],
  template: `
    <nav class="flex items-baseline gap-4 px-4 py-4 md:gap-16 md:px-12 md:py-8">
      <h1 class="font-sans tracking-tight text-lg font-bold text-teal-700">recipebase</h1>
      <div class="hidden items-baseline gap-6 md:flex">
        <a [routerLink]="['/']"
           class="relative text-gray-500 font-semibold pb-1 transition-colors
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full
                  after:origin-center after:scale-x-0 after:bg-teal-600
                  after:transition-transform after:duration-300 after:ease-out
                  hover:after:scale-x-100
                  after:rounded-full"
           routerLinkActive="text-gray-950 [&::after]:scale-x-100"
           [routerLinkActiveOptions]="{exact: true}">Home</a>
        <a [routerLink]="['/recipes']"
           class="relative text-gray-500 font-semibold pb-1 transition-colors
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full
                  after:origin-center after:scale-x-0 after:bg-teal-600
                  after:transition-transform after:duration-300 after:ease-out
                  hover:after:scale-x-100
                  after:rounded-full"
           routerLinkActive="text-gray-950 [&::after]:scale-x-100">Recipes</a>
        <a [routerLink]="['/import']"
           class="relative text-gray-500 font-semibold pb-1 transition-colors
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full
                  after:origin-center after:scale-x-0 after:bg-teal-600
                  after:transition-transform after:duration-300 after:ease-out
                  hover:after:scale-x-100
                  after:rounded-full"
           routerLinkActive="text-gray-950 [&::after]:scale-x-100">Import</a>
      </div>

      <div class="grow"></div>

      <ng-template #search><ng-icon name="lucideSearch" /></ng-template>

      <div class="hidden md:flex">
        <z-input-group [zAddonBefore]="search" class="w-78 bg-taupe-100">
          <input z-input placeholder="Search..." />
        </z-input-group>
      </div>
    </nav>
  `,
  viewProviders: [provideIcons({ lucideSearch })],
})
export class NavbarComponent {}
