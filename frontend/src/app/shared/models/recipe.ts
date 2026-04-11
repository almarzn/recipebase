export interface RecipeSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  variants: VariantSummary[];
}

export interface VariantSummary {
  slug: string;
  name: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
}

export interface Variant {
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  components: Component[];
}

export interface Component {
  id: string;
  title: string;
  description: string | null;
  link: ComponentLink;
  ingredients: Ingredient[];
  steps: Step[];
}

export type ComponentLink = ComponentLinkSelf | ComponentLinkExternal;

export interface ComponentLinkSelf {
  quality: "self";
}

export interface ComponentLinkExternal {
  quality: "external";
  slug: string;
  title: string;
  link: "snapshot" | "linked";
}

export interface Ingredient {
  slug: string;
  name: string;
  notes: string | null;
  quantity: Quantity;
}

export type Quantity =
  | { unit: "gram"; amount: number }
  | { unit: "kilogram"; amount: number }
  | { unit: "liter"; amount: number }
  | { unit: "milliliter"; amount: number }
  | { unit: "unspecified"; notes: string };

export interface Step {
  id: string;
  text: string;
  notes: string | null;
  attachment: TimerAttachment | null;
}

export interface TimerAttachment {
  duration: string;
}
