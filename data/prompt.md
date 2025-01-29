### General Guidelines

1. **Audience**: Recipes are intended for professional or semi-professional cooks. Avoid clarifications, background explanations, or "why" details. Focus solely on actionable instructions and tips to achieve the intended result.

2. **Chef Attribution**: Only include the chef’s name in the title if they are a well-known professional with credentials such as published cookbooks or significant media recognition. Omit names if there is any doubt about their credibility.

3. **Tips and Notes Usage**:

    - Add tips to the `notes` field only if they **improve the final result** (e.g., enhance texture, flavor, or appearance).
    - Avoid explaining "why" something is done; include only the "how." For example, use "Let the dough rest for 30 minutes to improve elasticity" rather than "This step allows gluten to form." Focus entirely on the actionable benefit.
    - Notes must always prioritize advanced cooks and should never restate obvious details or basic knowledge.

4. **Language Consistency**: Preserve the original language of the recipe text and the dish or recipe name. If the dish or recipe name is in a different language than the main text, do not translate it or infer a different language based on contextual mentions.&#x20;

### Handling Recipe Variants

1. If a recipe has **minor ingredient differences** (1–2 ingredients), handle these in the `notes` field of the relevant ingredient. For example:
    - `"notes": "Can be replaced with dark chocolate for a richer flavor."`
2. If variants involve **significant differences** (e.g., entirely new steps, major ingredient substitutions), create separate recipe objects for each variant. Never combine multiple variants into a single recipe using generalized `notes` fields.

### Servings and Yield

1. Include a `servings` field with the following structure:
    - `amount`: The number of servings. Default to `4` if unspecified, unless a more accurate inference can be made.
    - `notes`: Optional. Include details that refine or clarify the yield (e.g., "Yields 24 cookies" or "20 cm diameter cake"). Avoid generic comments and focus only on actionable or relevant details.

### Ingredients

1. List all ingredients under appropriate sections using a `separate` field for categorization (e.g., "Cake Base," "Frosting").
2. Include tips or substitutions in the `notes` field of the relevant ingredient. Avoid "why" explanations and focus only on actionable guidance or alternatives (e.g., "Use chilled butter for flakier crust").
3. Units must strictly adhere to the schema. For non-measurable ingredients (e.g., "eggs," "salt"), set `units` to `arbitrary.` Avoid repeating the quantity in the `notes` field unless it adds context (e.g., "1–2 teaspoons, depending on taste").
4. Always retain the original language of ingredient names and terms, even if they differ from the language of the main recipe text.

### Steps

1. Each step should describe a single, clear action. Avoid combining multiple actions into one step.
2. Use the `notes` field to improve the **final result** (e.g., "Ensure the dough is smooth before proceeding"), but do not explain the purpose or science behind the step.
3. Ranges for times or temperatures (e.g., "bake for 15–20 minutes") should be included directly in the step text and not in `notes`.

### Edge Cases

1. If the recipe is incomplete, retain the information as it appears in the source.
2. Ensure the original recipe language is preserved wherever possible.

### Handling Multiple Units

1. Always take the **first listed unit or temperature** and omit alternatives unless absolutely critical to the recipe's functionality.
