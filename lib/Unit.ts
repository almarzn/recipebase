import type { IngredientUnit } from "~/types/recipe";

type ImperialUnit = {
  long: string;
  short: string;
  type: "imperial";
  conversion: { rate: number; to: IngredientUnit };
};
type MetricUnit = {
  long: string;
  short: string;
  type: "metric";
};

const units: Record<IngredientUnit, ImperialUnit | MetricUnit> = {
  teaspoon: {
    long: "Teaspoon",
    short: "tsp",
    type: "imperial",
    conversion: { rate: 4.92892, to: "milliliter" },
  },
  tablespoon: {
    long: "Tablespoon",
    short: "tbsp",
    type: "imperial",
    conversion: { rate: 14.7868, to: "milliliter" },
  },
  cup: {
    long: "Cup",
    short: "cup",
    type: "imperial",
    conversion: { rate: 236.588, to: "milliliter" },
  },
  "fluid ounce": {
    long: "Fluid Ounce",
    short: "fl oz",
    type: "imperial",
    conversion: { rate: 29.5735, to: "milliliter" },
  },
  pint: {
    long: "Pint",
    short: "pt",
    type: "imperial",
    conversion: { rate: 473.176, to: "milliliter" },
  },
  quart: {
    long: "Quart",
    short: "qt",
    type: "imperial",
    conversion: { rate: 946.353, to: "milliliter" },
  },
  gallon: {
    long: "Gallon",
    short: "gal",
    type: "imperial",
    conversion: { rate: 3785.41, to: "milliliter" },
  },
  milliliter: { long: "Milliliter", short: "ml", type: "metric" },
  liter: {
    long: "Liter",
    short: "L",
    type: "metric",
  },
  deciliter: {
    long: "Deciliter",
    short: "dl",
    type: "metric",
  },
  centiliter: {
    long: "Centiliter",
    short: "cl",
    type: "metric",
  },
  gram: { long: "Gram", short: "g", type: "metric" },
  kilogram: {
    long: "Kilogram",
    short: "kg",
    type: "metric",
  },
  milligram: {
    long: "Milligram",
    short: "mg",
    type: "metric",
  },
  ounce: {
    long: "Ounce",
    short: "oz",
    type: "imperial",
    conversion: { rate: 28.3495, to: "gram" },
  },
  pound: {
    long: "Pound",
    short: "lb",
    type: "imperial",
    conversion: { rate: 453.592, to: "gram" },
  },
  stone: {
    long: "Stone",
    short: "st",
    type: "imperial",
    conversion: { rate: 6350.29, to: "gram" },
  },
  bushel: {
    long: "Bushel",
    short: "bu",
    type: "imperial",
    conversion: { rate: 35239.1, to: "milliliter" },
  },
  peck: {
    long: "Peck",
    short: "pk",
    type: "imperial",
    conversion: { rate: 8809.77, to: "milliliter" },
  },
  gill: {
    long: "Gill",
    short: "gi",
    type: "imperial",
    conversion: { rate: 118.294, to: "milliliter" },
  },
  dram: {
    long: "Dram",
    short: "dr",
    type: "imperial",
    conversion: { rate: 3.69669, to: "milliliter" },
  },
  scruple: {
    long: "Scruple",
    short: "s",
    type: "imperial",
    conversion: { rate: 1.29598, to: "gram" },
  },
  grain: {
    long: "Grain",
    short: "gr",
    type: "imperial",
    conversion: { rate: 0.0647989, to: "gram" },
  },
  millimeter: { long: "Millimeter", short: "mm", type: "metric" },
  centimeter: {
    long: "Centimeter",
    short: "cm",
    type: "metric",
  },
  meter: {
    long: "Meter",
    short: "m",
    type: "metric",
  },
  inch: {
    long: "Inch",
    short: "in",
    type: "imperial",
    conversion: { rate: 25.4, to: "millimeter" },
  },
  arbitrary: {
    long: "Arbitrary",
    short: "",
    type: "metric",
  },
};

const findImperialUnitConvertingTo = (unit: IngredientUnit): IngredientUnit => {
  return Object.entries(units)
    .filter(([_, props]) => {
      if (props.type !== "imperial") {
        return false;
      }
      if (props.conversion.to === unit) {
        return true;
      }
    })
    .map(([name]) => name as IngredientUnit)[0];
};

const allUnits = Object.entries(units).map(([name, props]) => ({
  name: name as IngredientUnit,
  ...props,
}));

const unitsOfType = (type: "metric" | "imperial") =>
  allUnits.filter((el) => el.type === type);

export const imperialUnits = unitsOfType("imperial");
export const metricUnits = unitsOfType("metric");

export const getUnitByShort = (short: string) => {
  return allUnits.find((it) => it.short === short)?.name;
};

export class UnitFormatter {
  constructor(
    private readonly options: {
      style: "long" | "short" | "full";
      type?: "imperial" | "metric";
    },
  ) {}

  formatUnit(name: IngredientUnit): string {
    const unit = units[name]!;

    if (this.options.type === "metric" && unit.type === "imperial") {
      return this.formatUnit(unit.conversion.to);
    }

    if (this.options.type === "imperial") {
      const imperialUnit = findImperialUnitConvertingTo(name);

      return this.formatUnit(imperialUnit);
    }

    switch (this.options.style) {
      case "long":
        return unit.long;
      case "short":
        return unit.short;
      case "full":
        return `${unit.long} (${unit.short})`;
    }
  }

  formatQuantity(quantity: number, name: IngredientUnit): string {
    const unit = units[name]!;

    if (this.options.type === "metric" && unit.type === "imperial") {
      return this.formatQuantity(
        quantity * unit.conversion.rate,
        unit.conversion.to,
      );
    }

    if (this.options.type === "imperial") {
      const imperialUnit = findImperialUnitConvertingTo(name);
      const imperialUnitDescription = units[imperialUnit];

      if (imperialUnitDescription.type === "metric") {
        throw new Error();
      }

      return this.formatQuantity(
        quantity / imperialUnitDescription.conversion.rate,
        imperialUnitDescription.conversion.to,
      );
    }

    return quantity.toLocaleString();
  }
}
