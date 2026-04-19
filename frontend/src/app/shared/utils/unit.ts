import type { Quantity, Unit } from "@/shared/models";
import {
  getUnitName,
  isDecimalQuantity,
  isIntervalQuantity,
  isStandardUnit,
  isUnspecifiedQuantity,
} from "@/shared/models";

export interface FormatQuantityOptions {
  unitDisplay?: "short" | "long" | "narrow";
}

/**
 * Get the Intl unit string for standard units
 */
function getIntlUnit(unit: Unit): string | null {
  if (isStandardUnit(unit)) {
    return unit.type;
  }
  return null;
}

/**
 * Format a number with optional unit display
 */
function formatNumber(amount: number, unit: Unit | null, options: FormatQuantityOptions): string {
  const intlUnit = unit ? getIntlUnit(unit) : null;

  if (intlUnit) {
    const format = new Intl.NumberFormat(undefined, {
      style: "unit",
      unit: intlUnit,
      unitDisplay: options.unitDisplay ?? "long",
    });
    return format.format(amount);
  }

  // For arbitrary or custom units, format number and append unit name
  const numberStr = new Intl.NumberFormat(undefined).format(amount);
  if (unit) {
    const unitName = getUnitName(unit);
    return `${numberStr} ${unitName}`;
  }
  return numberStr;
}

export const formatQuantity = (quantity: Quantity, options: FormatQuantityOptions = {}): string => {
  // Handle unspecified quantity (just notes)
  if (isUnspecifiedQuantity(quantity)) {
    return quantity.notes;
  }

  // Handle interval quantity (e.g., "100-200 grams")
  if (isIntervalQuantity(quantity)) {
    const intlUnit = getIntlUnit(quantity.unit);

    if (intlUnit) {
      const format = new Intl.NumberFormat(undefined, {
        style: "unit",
        unit: intlUnit,
        unitDisplay: options.unitDisplay ?? "long",
      });
      const fromStr = format.format(quantity.from);
      // Extract just the number part from formatted strings to avoid double units
      const fromNum = new Intl.NumberFormat(undefined).format(quantity.from);
      const toNum = new Intl.NumberFormat(undefined).format(quantity.to);
      const unitStr = fromStr.replace(fromNum, "").trim();
      return `${fromNum}-${toNum} ${unitStr}`;
    }

    // For arbitrary/custom units
    const fromStr = new Intl.NumberFormat(undefined).format(quantity.from);
    const toStr = new Intl.NumberFormat(undefined).format(quantity.to);
    const unitName = getUnitName(quantity.unit);
    return `${fromStr}-${toStr} ${unitName}`;
  }

  // Handle decimal quantity
  if (isDecimalQuantity(quantity)) {
    return formatNumber(quantity.amount, quantity.unit, options);
  }

  throw new Error(`Unknown quantity type: ${JSON.stringify(quantity)}`);
};
