/**
 * Type guards for generated Quantity types
 */
import type {
  Arbitrary,
  Custom,
  DecimalAmount,
  Gram,
  Interval,
  Kilogram,
  Liter,
  Milliliter,
  QuantityUnion as Quantity,
  UnitUnion as Unit,
  Unspecified,
} from "../server";

export type {
  Arbitrary,
  Custom,
  DecimalAmount,
  Gram,
  Interval,
  Kilogram,
  Liter,
  Milliliter,
  Quantity,
  Unit,
  Unspecified,
};

/**
 * Type guards for Quantity types
 */
export function isDecimalQuantity(q: Quantity): q is DecimalAmount {
  return q.type === "decimal";
}

export function isIntervalQuantity(q: Quantity): q is Interval {
  return q.type === "interval";
}

export function isUnspecifiedQuantity(q: Quantity): q is Unspecified {
  return q.type === "unspecified";
}

export function isStandardUnit(u: Unit): u is Gram | Kilogram | Liter | Milliliter {
  return u.type === "gram" || u.type === "kilogram" || u.type === "liter" || u.type === "milliliter";
}

export function isArbitraryUnit(u: Unit): u is Arbitrary {
  return u.type === "arbitrary";
}

export function isCustomUnit(u: Unit): u is Custom {
  return u.type === "custom";
}

/**
 * Get unit name for display
 */
export function getUnitName(unit: Unit): string {
  if (isCustomUnit(unit)) {
    return unit.name;
  }
  return unit.type;
}
