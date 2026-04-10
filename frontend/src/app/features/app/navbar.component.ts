import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <nav class="flex items-center justify-between gap-12 px-12 py-8">
      <h1 class="font-sans tracking-tight text-xl font-bold text-teal-700">recipebase</h1>
      <div class="flex items-center gap-6">
        <a [routerLink]="['/']" class="text-gray-500 font-semibold border-b-2 border-transparent">Home</a>
        <a [routerLink]="['/recipes']" class="text-gray-500 font-semibold border-b-2 border-transparent hover:border-b-gray-600"
           routerLinkActive="border-b-gray-950 text-gray-950">Recipes</a>
        <a [routerLink]="['/import']" class="text-gray-500 font-semibold border-b-2 border-transparent">Import</a>
      </div>

    </nav>
  `
})
export class NavbarComponent {
}

