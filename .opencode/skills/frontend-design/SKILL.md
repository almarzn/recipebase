---
name: frontend-design
description: Use when building web components, pages, or interfaces — creating new UI, styling existing components, or implementing visual designs
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, Angular, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Rules — Read This First

**EVERYTHING is Tailwind utility classes.** No raw CSS, no inline styles, no CSS custom properties, no `px`/`rem`/`em` values. If you can't express it with a Tailwind class, rethink the approach.

- Colors → Tailwind color classes (`bg-teal-500`, `text-orange-600`, `border-gray-200`)
- Spacing → Tailwind spacing scale (`p-4`, `gap-2`, `mt-8`, `mx-auto`)
- Typography → Tailwind type classes (`text-lg`, `font-bold`, `leading-relaxed`, `tracking-wide`)
- Layout → Tailwind layout utilities (`grid-cols-3`, `flex-col`, `items-center`, `gap-6`)
- Effects → Tailwind effect utilities (`shadow-lg`, `opacity-75`, `blur-sm`)

**Never write raw CSS.** Use Tailwind classes exclusively. If an animation or effect truly can't be done with existing Tailwind utilities, add it via Tailwind's `@theme` or `@utility` directive in the global stylesheet — not inline `<style>` blocks.

## Project Design Tokens

These overrides apply **always** for this project. They take precedence over any other suggestion in this skill.

### Typography

| Role     | Tailwind Font | Maps To           | Usage                                             |
|----------|--------------|-------------------|----------------------------------------------------|
| Body     | `font-sans`  | DM Sans           | All text, labels, inputs, buttons, captions        |
| Headings | `font-serif` | DM Serif Display  | All h1–h6, card titles, section headers, hero text |

- Google Fonts loaded in `styles.css`: DM Sans + DM Serif Display
- Tailwind config maps `sans` → DM Sans, `serif` → DM Serif Display
- Do **not** introduce other font families. Only `font-sans` and `font-serif`.

### Color Palette — Tailwind Classes Only

#### Primary (Teal)

| Class                | Use case                                      |
|----------------------|-----------------------------------------------|
| `text-teal-50`       | Text on dark teal backgrounds                 |
| `bg-teal-50`         | Light tinted backgrounds, badges              |
| `text-teal-600`      | Body text links, inline emphasis              |
| `bg-teal-600`        | Primary buttons, active nav items             |
| `text-teal-700`      | Hover/active text on light backgrounds        |
| `bg-teal-700`        | Hover/active buttons                          |
| `text-teal-800`      | Headings on light backgrounds                 |
| `bg-teal-900`        | Dark sections, footers                        |
| `border-teal-300`    | Subtle borders on light surfaces              |
| `border-teal-600`    | Active/focused input borders                  |
| `ring-teal-500`      | Focus rings on interactive elements           |
| `ring-teal-500/25`   | Subtle focus ring backgrounds                 |

#### Secondary (Orange)

| Class                | Use case                                      |
|----------------------|-----------------------------------------------|
| `text-orange-50`     | Text on dark orange backgrounds               |
| `bg-orange-50`       | Soft accent backgrounds, callout boxes        |
| `text-orange-500`    | CTAs, highlighted keywords, star ratings      |
| `bg-orange-500`      | Accent buttons, badges, notification dots     |
| `text-orange-600`    | Hover text on orange elements                 |
| `bg-orange-600`      | Hover accent buttons                          |
| `text-orange-700`    | Darker accent text for readability            |
| `border-orange-300`  | Accent borders                                |
| `border-orange-500`  | Active accent borders                         |

#### Neutrals

| Class                | Use case                                      |
|----------------------|-----------------------------------------------|
| `bg-white`           | Page background, cards                        |
| `bg-gray-50`         | Subtle surface backgrounds                    |
| `bg-gray-100`        | Hover rows, muted sections                    |
| `text-gray-900`      | Primary body text                             |
| `text-gray-700`      | Secondary body text                           |
| `text-gray-500`      | Muted text, placeholders                     |
| `text-gray-400`      | Disabled text                                 |
| `border-gray-200`    | Default borders, dividers                     |
| `border-gray-300`    | Input borders                                 |
| `ring-gray-300`      | Neutral focus rings                           |

#### Semantic

| Class                | Use case                                      |
|----------------------|-----------------------------------------------|
| `text-red-600`       | Error text                                    |
| `bg-red-50`          | Error backgrounds                             |
| `border-red-300`     | Error input borders                           |
| `text-green-700`     | Success text                                  |
| `bg-green-50`        | Success backgrounds                           |

**Rule**: Stick to `teal-*` and `orange-*` for brand identity. Use `gray-*` for neutrals. Use `red-*`/`green-*` only for semantic meaning (errors, success). Never introduce `purple`, `blue`, `pink`, etc. unless explicitly requested.

### Legibility Is Key

All legibility enforced through Tailwind classes:

- **Contrast**: Pair `text-gray-900` on `bg-white` or `bg-gray-50`. Use `text-teal-50` on `bg-teal-900`. Never `text-gray-400` on light backgrounds for anything the user must read.
- **Font size**: Body text → `text-base` (16px) minimum. Secondary text → `text-sm` (14px) minimum. Never `text-xs` for readable content.
- **Line height**: Body copy → `leading-relaxed` (1.625) or `leading-7` (1.75). Headings → `leading-tight` (1.25) or `leading-none` (1).
- **Measure**: Limit body text width with `max-w-prose` (65ch) or `max-w-2xl` (672px).
- **Spacing**: Paragraphs → `mb-4` or `mb-6`. Sections → `py-12` to `py-24`. Never cramp content — use `space-y-4`+ for stacked elements.
- **Heading hierarchy**: `font-serif text-4xl` for heroes, `font-serif text-2xl` for sections, `font-serif text-xl` for cards. Always `font-semibold` or `font-bold` for headings. Body stays `font-sans font-normal`.

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Leverage `font-serif` for headings — combine with `tracking-tight`, `text-4xl`/`text-5xl` for dramatic scale. Use `font-sans` body text with weight range: `font-light` for elegance, `font-medium` for emphasis, `font-bold` for strong CTAs.
- **Color & Theme**: Teal base (`bg-teal-600`, `text-teal-700`) provides calm trust. Orange accents (`bg-orange-500`, `text-orange-500`) inject energy. Don't blend evenly — let teal dominate surfaces and orange punctuate interactive moments.
- **Motion**: Use Tailwind's `transition-*` utilities (`transition-all duration-300`, `transition-colors duration-200`), `hover:scale-105`, `hover:shadow-xl`, `animate-pulse`, `animate-spin`. For staggered reveals, use `animate-[fadeSlideUp_0.5s_ease-out]` with `animation-delay-[100ms]` etc. via arbitrary values. Keep it CSS-only — no JS animation libraries unless the effect truly demands it.
- **Spatial Composition**: Use Tailwind grid/flex — `grid grid-cols-12 gap-8`, `flex flex-col md:flex-row`, `-mt-8` for overlapping elements, `space-x-6` for horizontal rhythm. Asymmetry via `col-span-7` + `col-span-5` instead of even halves.
- **Backgrounds & Visual Details**: Tailwind gradient utilities (`bg-gradient-to-br from-teal-50 to-white`), `shadow-2xl`, `ring-1 ring-gray-200`, `backdrop-blur-md bg-white/75` for glass effects, `border-l-4 border-orange-500` for accent strips. Use `bg-[url('/noise.svg')]` sparingly for texture.

**NEVER** use:

- Generic fonts (Arial, Inter, Roboto, system fonts) — always `font-sans` (DM Sans) and `font-serif` (DM Serif Display)
- Purple gradients or overused AI color schemes
- Raw CSS properties, inline `style=""`, or `px`/`rem` values outside Tailwind
- Predictable layouts and component patterns that lack context-specific character
- Cookie-cutter design — every interface should feel intentionally crafted

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different aesthetics — but always respect the project tokens above.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate Tailwind markup with gradients, shadows, and transforms. Minimalist or refined designs need restraint — generous spacing (`p-12`, `gap-8`), precise typography (`text-lg leading-relaxed`), and subtle borders (`border border-gray-100`).
