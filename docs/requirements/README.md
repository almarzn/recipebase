### Recipe Manager — Vision & Goals

This document captures what the application is for, who it serves, and what the cook needs to be able to do. It makes no decisions about how any of it is implemented. All design, data model, and UX decisions belong in scoped documents.

#### What This Is
A personal, self-hosted recipe manager built for an experienced home cook with a strong background in pastry. It is accessible across the user's devices without relying on third-party cloud infrastructure. It is not a beginner tool, not a social platform, and not a meal planner.

#### Who It Is For
A single experienced home cook who:
* Has an existing collection of recipes from many sources — websites, books, digital documents, and handwritten notes.
* Works seriously with pastry and baking, where precision and technique matter.
* Wants to own and organize their culinary knowledge in one place.
* Cooks from mobile devices in the kitchen as often as from a desktop computer.

#### What the Cook Needs to Do

**Bring recipes in**
* I want to seamlessly import recipes from digital sources (like websites) without manual data entry.
* I want to extract usable recipe information from static files, such as digital documents or images of physical books.
* I want to create a recipe entirely from scratch.
* I want the ability to verify, edit, and correct any imported recipe data to ensure accuracy before it is permanently added to my library.
* I want to remain in complete control of the import process, with the ability to review, modify, and approve all captured data before it is committed to my library.

**Organise and find**
* I want to retrieve any recipe in my library efficiently, regardless of the library's total size.
* I want the flexibility to organize recipes according to my own logic, rather than being forced into a rigid, pre-defined taxonomy.
* I want to search my library across multiple parameters (e.g., ingredients, names, tags, or other relevant attributes).
* I want to link or group recipes that act as variants of one another, maintaining a cohesive library.

**Work with precision**
* I want the system to treat ingredients and their quantities as calculable elements, rather than plain text, to enable automated scaling and conversions.
* I want to scale any recipe up or down and have every associated quantity recalculate accurately.
* I want to prioritize working in weights over volumes.
* I want baker's percentages calculated and displayed for any recipe involving flour.
* I want the ability to document and reference ingredient substitutions or alternatives for a recipe.

**Know what a recipe produces**
* I want every recipe to define its yield in calculable units (e.g., total weight, total volume, or discrete portions).
* I want to know the total yield of a recipe before I begin cooking.
* I want a recipe's yield to be mathematically usable when that recipe is inserted as a component into a larger dish.

**Build composed dishes**
* I want to assemble a master recipe using other standalone recipes as components (e.g., treating a specific sponge, cream, and glaze as individual parts of an entremet).
* I want to easily comprehend the full hierarchy and nested components of a composed dish.
* I want to scale the master dish and have the new math cascade automatically through all nested components.
* I want to override standard ratios by independently adjusting the proportion of a single component within a composed dish.
* I want to choose whether a component dynamically updates if its original source recipe changes, or if it remains locked to the version it was when I added it.
* I want to reuse a single component recipe across multiple different composed dishes.

**Cook**
* I need a presentation mode optimized for active cooking that surfaces only what I need, when I need it.
* I want the ability to track time based on specific recipe steps.
* I want the quantities displayed during active cooking to strictly reflect the scale I established before starting.
* I need the active cooking experience to be highly usable on mobile devices in a physical kitchen environment (e.g., readable at a glance, requiring minimal physical interaction).

**Remember and improve**
* I want to record notes, outcomes, and planned adjustments for future attempts after cooking a recipe.
* I want to track my ratings and impressions of a recipe across multiple distinct attempts.
* I want to attach annotations to a recipe without altering the core recipe itself.

#### Product Principles (What It Must Feel Like)
* **Highly Efficient:** The cook should be able to navigate the system and retrieve information with minimal friction.
* **Honest about complexity:** Pastry is precise; the system should expose necessary complexity rather than hiding it behind false simplicity.
* **Trustworthy:** Data entered must remain strictly intact. Scaling math must be completely reliable. No automated alterations should occur without the cook's intent.
* **Unobtrusive in the kitchen:** During active cooking, the system must minimize cognitive load and not distract from the physical task of baking.

#### What It Is Not
* A beginner cooking app with guided recipes and simplified instructions.
* A meal planner or shopping list generator.
* A social or sharing platform.
* A cloud service — the cook owns the data and the infrastructure.
* A native mobile app — a browser interface is sufficient.
