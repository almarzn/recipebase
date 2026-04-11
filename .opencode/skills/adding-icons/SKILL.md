---
name: adding-icons
description: Use when adding icons, displaying icons, or troubleshooting icon rendering in the Angular frontend — icon not showing, missing icon, need an icon for a button/status/navigation, find icon by keyword
---

# Adding Icons to the Frontend

**NEVER write raw SVG.** Always use `<ng-icon>` with Lucide icons from `@ng-icons/lucide`.

## Finding an Icon

Search `frontend/node_modules/lucide-static/tags.json` by keyword:

```bash
grep -i '"error"' frontend/node_modules/lucide-static/tags.json -B 2
grep -iE '"(add|plus|new)"' frontend/node_modules/lucide-static/tags.json -B 2 | head -40
```

| Use Case | Search Keywords |
|----------|----------------|
| Error/Alert | `"error"`, `"alert"`, `"warning"` |
| Success | `"check"`, `"success"`, `"done"` |
| Add/Create | `"add"`, `"plus"`, `"new"` |
| Delete | `"delete"`, `"remove"`, `"trash"` |
| Navigation | `"arrow"`, `"navigation"`, `"home"` |
| Status | `"loading"`, `"spinner"`, `"sync"` |

## Adding an Icon to a Component

Three things required — all three. Icons fail silently if any is missing.

**1. Import the icon** from `@ng-icons/lucide` (kebab-case → camelCase: `circle-x` → `lucideCircleX`):

```typescript
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCircleX, lucidePlus } from "@ng-icons/lucide";
```

**2. Register in `viewProviders`** — icons are per-component, NOT global:

```typescript
@Component({
  imports: [NgIcon],
  viewProviders: [provideIcons({ lucideCircleX, lucidePlus })],
  // ...
})
```

**3. Use in template:**

```html
<ng-icon name="lucideCircleX" />
```

## Sizing Icons

Icons inherit font-size. Use Tailwind classes:

- Directly: `<ng-icon name="lucideX" class="size-4!" />` (the `!` = `!important`, used in dialogs)
- Via text size: `<ng-icon name="lucideHome" class="text-xl" />`
- Inside `<button z-button>`: button variants auto-size SVGs via `[&_svg:not([class*='size-'])]:size-4` — no class needed for default size. Override with explicit `size-*` class.

## Troubleshooting

1. Import missing from `@ng-icons/lucide`?
2. Icon added to `provideIcons({...})` in `viewProviders`?
3. `name` using correct camelCase (`lucideCircleX` not `lucide-circle-x`)?
4. Icon has a size class or inherited font-size?
