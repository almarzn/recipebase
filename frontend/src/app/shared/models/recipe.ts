/** Item summary — returned by GET /items */
export interface Item {
  id: string;
  slug: string;
  type: string;
  name: string;
  tags: string[];
}

/** Source JSONB */
export type Source = { type: "url"; url: string } | { type: "book"; reference: string } | { type: "original" };

/** Yield JSONB */
export interface Yield {
  quantity: number;
  unit: string;
  description: string | null;
}

/** Quantity JSONB — {value, unit} */
export interface Quantity {
  value: number;
  unit: string;
}

export interface Ingredient {
  id: string;
  slug: string;
  name: string;
  quantity: Quantity;
  notes: string | null;
  position: number;
}

export interface Step {
  id: string;
  slug: string;
  order: number;
  body: string;
  timer_seconds: number | null;
}

export interface Component {
  id: string;
  slug: string;
  name: string | null;
  position: number;
  ingredients: Ingredient[];
  steps: Step[];
}

/** Full recipe — returned by GET /recipes/:slug */
export interface Recipe {
  id: string;
  slug: string;
  name: string;
  tags: string[];
  source: Source | null;
  yield: Yield | null;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}
