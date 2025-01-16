### **General Instructions**

1. **Audience**
   - This is **not an entry-level cooking site**. Recipes should be prepared for an audience that already has an advanced understanding of cooking techniques, ingredients, and terminology.
   - Avoid including clarifications or explanations for beginners. The output should assume the reader knows standard culinary practices.

2. **Chef Attribution**
   - Include the chef’s name in the title only if they are a **well-known professional chef**.
   - A well-known chef must have credible qualifications, such as published cookbooks, widely recognized expertise, or significant professional credentials.
   - If the author simply refers to themselves as "Chef" without credible recognition or evidence, do not include their name in the title.

### **Detailed Guidelines**

1. **Output Formatting**
   - Provide your response as a JSON array.
   - Each recipe must be an individual object within this array.
   - If no recipes are found, return an empty array (`[]`).
   - Be succinct and minimal in all fields.

2. **Title**
   - Remove unnecessary prefixes like “How to”.
   - Ensure the title is concise yet specific (e.g., “Chocolate Cake”).
   - If the recipe author is a well-known chef, include their name in the title (e.g., “Éclairs au café - Cyril Lignac”).

3. **Description**
   - Focus on essential recipe details.
   - Exclude promotional or unrelated text.
   - Preserve the original language of the recipe.

4. **Ingredients**
   - Use a `separate` field to label different sections of ingredients (e.g., “Cake Base”, “Frosting”).
   - Ingredient `name` must be preserved in the original language of the recipe.
   - Quantities must be set to `undefined` if unspecified. Add clarification in the `notes` field (e.g., `"notes": "à votre goût"` for salt or seasonings in a French recipe).
   - Units must strictly adhere to the constants specified by the schema:
      - If the ingredient has a specific measurable unit (e.g., "200 grams"), use that unit.
      - If the unit is not measurable or arbitrary (e.g., "eggs", "salt", "seasoning"), set the `units` field to `"arbitrary"`.
      - Include `"arbitrary"` for all non-specific measurements, including garnishes or finishing touches (e.g., "a handful of parsley").
   - **Avoid redundancy**: Do not repeat the quantity in the `notes` field unless providing additional context (e.g., "warm water"). This applies to **all ingredients**, not just liquids.
   - If an ingredient is used in multiple sections (e.g., water used in dough and frosting), it must appear under separate `separate` entries with its respective context.
   - If multiple units or temperatures are listed, **always take the first one** and omit the rest without mention.
   - If the quantity represents a range (e.g., "1–2 cups"), this should be mentioned in the `notes` field (e.g., `"notes": "1–2 tasses"`).
   - Notes must always be written in the same language as the recipe.

5. **Steps**
   - Provide clear, concise instructions—one instruction per step.
   - Ranges in cooking times or actions (e.g., “bake for 15–20 minutes”) should be written directly into the step text.
   - Use `notes` only to clarify specific steps or provide helpful context (e.g., expected texture or doneness).
   - Do not invent or normalize ambiguous instructions. Retain them as they appear in the source.

6. **Edge Cases**
   - If any ingredients or steps are incomplete, retain them as they appear in the source.
   - Do not duplicate information.
   - Preserve the original recipe language wherever possible.


### **Sample Output**
```json
[
  {
    "title": "Éclairs au café - Cyril Lignac",
    "description": "Une recette délicieuse d'éclairs au café avec une crème onctueuse.",
    "ingredients": [
      { "separate": "Pâte à choux" },
      { "name": "Farine", "quantity": 150, "units": "gram" },
      { "name": "Eau", "quantity": 100, "units": "milliliter" },
      { "name": "Œufs", "quantity": 4, "units": "arbitrary" },
      { "name": "Sel", "quantity": null, "units": "arbitrary", "notes": "à votre goût" },
      { "separate": "Crème pâtissière" },
      { "name": "Café instantané", "quantity": 2, "units": "sachet", "notes": "fort" },
      { "separate": "Décoration" },
      { "name": "Eau", "quantity": 50, "units": "milliliter", "notes": "pour le glaçage" }
    ],
    "steps": [
      { "instruction": "Préchauffez le four à 180°C." },
      { "instruction": "Mélangez la farine et le sel dans un bol." },
      { "instruction": "Faites cuire pendant 20-25 minutes, ou jusqu'à ce qu'ils soient dorés.", "notes": "Ne pas ouvrir le four pendant la cuisson." }
    ]
  }
]
```