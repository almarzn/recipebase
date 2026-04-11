import { Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBookOpen, lucideFileUp, lucideHome, lucideSearch, lucideX } from "@ng-icons/lucide";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardInputGroupComponent } from "@/shared/components/input-group";

@Component({
  selector: "app-bottom-tab-bar",
  imports: [RouterLink, RouterLinkActive, NgIcon, ZardInputDirective, ZardInputGroupComponent],
  template: `
    @if (searchOpen()) {
      <div class="fixed inset-0 z-50 bg-black/30" (click)="searchOpen.set(false)">
        <div class="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-4 shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-center gap-2 mb-3">
            <ng-template #searchIcon><ng-icon name="lucideSearch" /></ng-template>
            <z-input-group [zAddonBefore]="searchIcon" class="flex-1">
              <input z-input placeholder="Search recipes..." autofocus />
            </z-input-group>
            <button (click)="searchOpen.set(false)"
                    class="text-gray-400 hover:text-gray-600 transition-colors">
              <ng-icon name="lucideX" />
            </button>
          </div>
        </div>
      </div>
    }

    <nav class="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white md:hidden safe-bottom">
      <div class="flex items-center justify-around py-2">
        <a [routerLink]="['/']"
           class="relative flex flex-col items-center gap-0.5 px-4 py-2 text-gray-500 transition-colors
                  hover:bg-teal-50 hover:text-teal-700 rounded-lg"
           routerLinkActive="!text-teal-600 !bg-teal-50"
           [routerLinkActiveOptions]="{exact: true}">
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-teal-600
                       transition-transform duration-300 scale-x-0"
                routerLinkActive="!scale-x-100"
                [routerLinkActiveOptions]="{exact: true}"></span>
          <ng-icon name="lucideHome" class="text-xl" />
          <span class="text-xs font-medium">Home</span>
        </a>
        <a [routerLink]="['/recipes']"
           class="relative flex flex-col items-center gap-0.5 px-4 py-2 text-gray-500 transition-colors
                  hover:bg-teal-50 hover:text-teal-700 rounded-lg"
           routerLinkActive="!text-teal-600 !bg-teal-50">
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-teal-600
                       transition-transform duration-300 scale-x-0"
                routerLinkActive="!scale-x-100"></span>
          <ng-icon name="lucideBookOpen" class="text-xl" />
          <span class="text-xs font-medium">Recipes</span>
        </a>
        <a [routerLink]="['/import']"
           class="relative flex flex-col items-center gap-0.5 px-4 py-2 text-gray-500 transition-colors
                  hover:bg-teal-50 hover:text-teal-700 rounded-lg"
           routerLinkActive="!text-teal-600 !bg-teal-50">
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-teal-600
                       transition-transform duration-300 scale-x-0"
                routerLinkActive="!scale-x-100"></span>
          <ng-icon name="lucideFileUp" class="text-xl" />
          <span class="text-xs font-medium">Import</span>
        </a>
        <button (click)="searchOpen.set(true)"
                class="flex flex-col items-center gap-0.5 px-4 py-2 text-gray-500 transition-colors
                       hover:bg-teal-50 hover:text-teal-700 rounded-lg">
          <ng-icon name="lucideSearch" class="text-xl" />
          <span class="text-xs font-medium">Search</span>
        </button>
      </div>
    </nav>
  `,
  viewProviders: [
    provideIcons({
      lucideHome,
      lucideBookOpen,
      lucideFileUp,
      lucideSearch,
      lucideX,
    }),
  ],
})
export class BottomTabBarComponent {
  searchOpen = signal(false);
}
