import type { Quantity, Unit } from "@/shared/models";
import { isDecimalQuantity, isIntervalQuantity, isStandardUnit, isUnspecifiedQuantity } from "@/shared/models";
import type { DecimalAmount, Interval, Unspecified } from "@/shared/server";

export interface FormatQuantityOptions {
  unitDisplay?: "short" | "long" | "narrow";
}

/**
 * Unit aliases and abbreviations mapping to canonical unit types
 * (Standard units only - arbitrary is fallback for number-only, custom is for number+text)
 */
const UNIT_ALIASES: Record<string, string> = {
  // Mass - gram
  g: "gram",
  gram: "gram",
  grams: "gram",
  gr: "gram",
  grm: "gram",
  // Mass - kilogram
  kg: "kilogram",
  kilogram: "kilogram",
  kilograms: "kilogram",
  kilo: "kilogram",
  kilos: "kilogram",
  // Volume - milliliter
  ml: "milliliter",
  milliliter: "milliliter",
  milliliters: "milliliter",
  millilitre: "milliliter",
  millilitres: "milliliter",
  cc: "milliliter",
  // Volume - liter
  l: "liter",
  liter: "liter",
  liters: "liter",
  litre: "liter",
  litres: "liter",
};

/**
 * Get canonical unit type from an alias
 */
function resolveUnitAlias(alias: string): string | null {
  const normalized = alias.toLowerCase().trim();
  return UNIT_ALIASES[normalized] ?? null;
}

/**
 * Create a Unit object from a canonical type name
 */
function createUnit(type: string, customName?: string): Unit {
  if (type === "custom") {
    return { type: "custom", name: customName ?? "" };
  }
  if (type === "gram") return { type: "gram" };
  if (type === "kilogram") return { type: "kilogram" };
  if (type === "milliliter") return { type: "milliliter" };
  if (type === "liter") return { type: "liter" };
  return { type: "arbitrary" };
}

/**
 * Parse human-written quantity text into a Quantity object.
 *
 * Type resolution:
 * - arbitrary: number only (e.g., "5", "1.5", "10-20")
 * - custom: number + text (e.g., "4 parts", "2 slices of bread")
 * - unspecified: no number (e.g., "a handful", "to taste")
 *
 * Examples:
 * ```ts
 * parseQuantity("12.5 g")        // { type: "decimal", amount: 12.5, unit: { type: "gram" } }
 * parseQuantity("14 ml")           // { type: "decimal", amount: 14, unit: { type: "milliliter" } }
 * parseQuantity("4 parts")         // { type: "decimal", amount: 4, unit: { type: "custom", name: "parts" } }
 * parseQuantity("5")               // { type: "decimal", amount: 5, unit: { type: "arbitrary" } }
 * parseQuantity("a handful")       // { type: "unspecified", notes: "a handful" }
 * parseQuantity("13 - 15 g")       // { type: "interval", from: 13, to: 15, unit: { type: "gram" } }
 * parseQuantity("3-5 parts")       // { type: "interval", from: 3, to: 5, unit: { type: "custom", name: "parts" } }
 * ```
 */
export function parseQuantity(text: string): Quantity {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("Cannot parse empty quantity text");
  }

  // Try interval patterns first (e.g., "13-15 g", "10 to 20 ml", "5–10 parts")
  const intervalMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:-|–|to|~)\s*(\d+(?:\.\d+)?)\s*(.*)$/i);

  if (intervalMatch) {
    const from = parseFloat(intervalMatch[1]);
    const to = parseFloat(intervalMatch[2]);
    const unitText = intervalMatch[3].trim();

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      throw new Error(`Invalid interval numbers in: "${text}"`);
    }

    // Empty unit text → arbitrary
    if (!unitText) {
      return {
        type: "interval",
        from,
        to,
        unit: { type: "arbitrary" },
      } as Interval;
    }

    // Try to parse as standard unit
    const standardUnit = parseStandardUnit(unitText);
    if (standardUnit) {
      return { type: "interval", from, to, unit: standardUnit } as Interval;
    }

    // Has text but not a standard unit → custom with the full text as name
    return {
      type: "interval",
      from,
      to,
      unit: { type: "custom", name: unitText },
    } as Interval;
  }

  // Try decimal pattern (e.g., "12.5 g", "14ml", "4 parts", "5")
  const decimalMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)$/i);

  if (decimalMatch) {
    const amount = parseFloat(decimalMatch[1]);
    const unitText = decimalMatch[2].trim();

    if (!Number.isFinite(amount)) {
      throw new Error(`Invalid amount in: "${text}"`);
    }

    // Empty unit text → arbitrary (just the number)
    if (!unitText) {
      return {
        type: "decimal",
        amount,
        unit: { type: "arbitrary" },
      } as DecimalAmount;
    }

    // Try to parse as standard unit
    const standardUnit = parseStandardUnit(unitText);
    if (standardUnit) {
      return { type: "decimal", amount, unit: standardUnit } as DecimalAmount;
    }

    // Has text but not a standard unit → custom with the full text as name
    return {
      type: "decimal",
      amount,
      unit: { type: "custom", name: unitText },
    } as DecimalAmount;
  }

  // No number detected → unspecified (free text)
  return { type: "unspecified", notes: trimmed } as Unspecified;
}

/**
 * Parse unit text into a standard Unit object.
 * Returns null if text is not a recognized standard unit (g, kg, ml, l, etc).
 */
function parseStandardUnit(unitText: string): Unit | null {
  if (!unitText) return null;

  const normalized = unitText.toLowerCase().trim();

  // Check for standard unit aliases
  const canonicalType = resolveUnitAlias(normalized);
  if (canonicalType) {
    return createUnit(canonicalType);
  }

  return null;
}

/**
 * Format a Quantity object into human-readable text.
 *
 * Examples:
 * ```ts
 * formatQuantity({ type: "decimal", amount: 12.5, unit: { type: "gram" } })
 * // → "12.5 g"
 *
 * formatQuantity({ type: "interval", from: 13, to: 15, unit: { type: "gram" } })
 * // → "13 - 15 g"
 *
 * formatQuantity({ type: "unspecified", notes: "a handful" })
 * // → "a handful"
 *
 * formatQuantity({ type: "decimal", amount: 4, unit: { type: "custom", name: "parts" } })
 * // → "4 parts"
 * ```
 */
export function formatQuantity(quantity: Quantity, options: FormatQuantityOptions = {}): string {
  // Handle unspecified quantity (just notes)
  if (isUnspecifiedQuantity(quantity)) {
    return quantity.notes;
  }

  // Handle interval quantity
  if (isIntervalQuantity(quantity)) {
    const unitStr = formatUnit(quantity.unit, options);
    const fromStr = formatNumber(quantity.from);
    const toStr = formatNumber(quantity.to);
    return `${fromStr} - ${toStr}${unitStr ? ` ${unitStr}` : ""}`;
  }

  // Handle decimal quantity
  if (isDecimalQuantity(quantity)) {
    const amountStr = formatNumber(quantity.amount);
    const unitStr = formatUnit(quantity.unit, options);
    return `${amountStr}${unitStr ? ` ${unitStr}` : ""}`;
  }

  throw new Error(`Unknown quantity type: ${JSON.stringify(quantity)}`);
}

/**
 * Format a number for display (removes trailing zeros)
 */
function formatNumber(n: number): string {
  // Use enough precision but remove unnecessary trailing zeros
  return parseFloat(n.toPrecision(12)).toString();
}

/**
 * Format a Unit object into display string
 */
function formatUnit(unit: Unit, options: FormatQuantityOptions = {}): string {
  // For standard units, use abbreviations in short mode, full names otherwise
  if (isStandardUnit(unit)) {
    if (options.unitDisplay === "short" || options.unitDisplay === "narrow") {
      const abbreviations: Record<string, string> = {
        gram: "g",
        kilogram: "kg",
        milliliter: "ml",
        liter: "l",
      };
      return abbreviations[unit.type] ?? unit.type;
    }
    // Default: use pluralized full name
    return `${unit.type}s`;
  }

  // For custom units, use the custom name
  if (unit.type === "custom") {
    return unit.name;
  }

  // For arbitrary units, no display
  return "";
}
