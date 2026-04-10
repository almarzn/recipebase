# Responsive Navbar with Bottom Tab Bar

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the navbar responsive — desktop keeps the current top bar, mobile (<md) shows a brand-only top bar plus a fixed bottom tab bar with Home, Recipes, Import, and Search.

**Architecture:** Single navbar component split into two visual zones with Tailwind responsive breakpoints. A new `BottomTabBarComponent` handles the mobile tab bar. The app layout adds bottom padding on mobile so content doesn't hide behind the fixed bar. Search on mobile opens an overlay input from the bottom bar.

**Tech Stack:** Angular 21, Tailwind CSS 4, Zard UI (input components), @ng-icons/lucide, signals

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/app/features/app/navbar.component.ts` | Modify | Make desktop nav responsive — hide links/search on mobile |
| `frontend/src/app/features/app/bottom-tab-bar.component.ts` | Create | Mobile bottom tab bar with icons + labels |
| `frontend/src/app/app.ts` | Modify | Import BottomTabBarComponent |
| `frontend/src/app/app.html` | Modify | Add bottom tab bar + mobile padding |

---

### Task 1: Make navbar responsive

**Files:**
- Modify: `frontend/src/app/features/app/navbar.component.ts`

- [ ] **Step 1: Update the nav element to hide links and search on mobile**

Replace the entire template in `navbar.component.ts`. Changes:
- Wrap nav links in a div with `hidden md:flex` — hidden on mobile, visible on desktop
- Wrap search in a div with `hidden md:flex` — hidden on mobile
- Keep brand always visible
- Reduce padding on mobile: `px-4 py-4 md:px-12 md:py-8`
- Reduce gap on mobile: `gap-4 md:gap-16`

```typescript
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
```

- [ ] **Step 2: Verify desktop still works**

Run: `cd frontend && npx ng serve` — open localhost:4200, confirm desktop navbar unchanged.

---

### Task 2: Create bottom tab bar component

**Files:**
- Create: `frontend/src/app/features/app/bottom-tab-bar.component.ts`

- [ ] **Step 1: Create the bottom tab bar component**

The component uses signals for search overlay state, Lucide icons for each tab, and `RouterLink`/`RouterLinkActive` for navigation. Search tab doesn't navigate — it toggles an overlay.

```typescript
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHome, lucideBookOpen, lucideFileUp, lucideSearch, lucideX } from '@ng-icons/lucide';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardInputGroupComponent } from '@/shared/components/input-group';

@Component({
  selector: 'app-bottom-tab-bar',
  imports: [RouterLink, RouterLinkActive, NgIcon, ZardInputDirective, ZardInputGroupComponent],
  template: `
    @if (searchOpen()) {
      <div class="fixed inset-0 z-50 bg-black/30" (click)="searchOpen.set(false)">
        <div class="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-4 shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-center gap-2 mb-3">
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

    <nav class="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white md:hidden">
      <div class="flex items-center justify-around py-2">
        <a [routerLink]="['/']"
           class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 transition-colors"
           routerLinkActive="!text-teal-600"
           [routerLinkActiveOptions]="{exact: true}">
          <ng-icon name="lucideHome" class="text-xl" />
          <span class="text-xs font-medium">Home</span>
        </a>
        <a [routerLink]="['/recipes']"
           class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 transition-colors"
           routerLinkActive="!text-teal-600">
          <ng-icon name="lucideBookOpen" class="text-xl" />
          <span class="text-xs font-medium">Recipes</span>
        </a>
        <a [routerLink]="['/import']"
           class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 transition-colors"
           routerLinkActive="!text-teal-600">
          <ng-icon name="lucideFileUp" class="text-xl" />
          <span class="text-xs font-medium">Import</span>
        </a>
        <button (click)="searchOpen.set(true)"
                class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 transition-colors hover:text-teal-600">
          <ng-icon name="lucideSearch" class="text-xl" />
          <span class="text-xs font-medium">Search</span>
        </button>
      </div>
    </nav>
  `,
  viewProviders: [
    provideIcons({ lucideHome, lucideBookOpen, lucideFileUp, lucideSearch, lucideX })
  ]
})
export class BottomTabBarComponent {
  searchOpen = signal(false);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx ng build` — confirm no errors.

---

### Task 3: Wire bottom tab bar into app layout

**Files:**
- Modify: `frontend/src/app/app.ts`
- Modify: `frontend/src/app/app.html`

- [ ] **Step 1: Import BottomTabBarComponent in app.ts**

Add the import:

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@/features/app/navbar.component';
import { BottomTabBarComponent } from '@/features/app/bottom-tab-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, BottomTabBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: 'flex flex-col min-h-screen items-stretch bg-background'
  }
})
export class App {
  protected readonly title = signal('frontend');
}
```

- [ ] **Step 2: Add bottom tab bar and mobile padding to app.html**

The `<router-outlet>` gets `pb-20 md:pb-0` so mobile content clears the fixed bottom bar. The bottom tab bar is always rendered but only visible on mobile via its own `md:hidden`.

```html
<app-navbar></app-navbar>
<div class="flex-1 pb-20 md:pb-0">
  <router-outlet />
</div>
<app-bottom-tab-bar></app-bottom-tab-bar>
```

- [ ] **Step 3: Verify full app works**

Run: `cd frontend && npx ng serve` — test both desktop and mobile viewports (DevTools responsive mode). Confirm:
- Desktop: navbar unchanged, no bottom bar visible
- Mobile (<768px): brand-only top bar, bottom tab bar visible, content not hidden behind bar
- Tapping Search opens the overlay
- Active tab highlights correctly

---

### Task 4: Commit

- [ ] **Step 1: Commit all changes**

```bash
git add frontend/src/app/features/app/navbar.component.ts
git add frontend/src/app/features/app/bottom-tab-bar.component.ts
git add frontend/src/app/app.ts
git add frontend/src/app/app.html
git commit -m "feat: responsive navbar with mobile bottom tab bar"
```
