import type { IngredientUnit } from "~/types/recipe";
type Format = Record<Style, string>;

const defaultF = (unit: { long: string; short: string }): Format => ({
  long: unit.long,
  short: unit.short,
  full: `${unit.long} (${unit.short})`,
  "full-inverted": `${unit.short} (${unit.long})`,
});

type ImperialUnit = {
  format: Format;
  type: "imperial";
  conversion: { rate: number; to: IngredientUnit };
};
type MetricUnit = {
  format: Format;
  type: "metric";
};

type Style = "long" | "short" | "full" | "full-inverted";

const units: Record<IngredientUnit, ImperialUnit | MetricUnit> = {
  teaspoon: {
    format: defaultF({ long: "teaspoon", short: "tsp" }),
    type: "imperial",
    conversion: { rate: 4.92892, to: "milliliter" },
  },
  tablespoon: {
    format: defaultF({ long: "tablespoon", short: "tbsp" }),
    type: "imperial",
    conversion: { rate: 14.7868, to: "milliliter" },
  },
  cup: {
    format: defaultF({ long: "cup", short: "cup" }),
    type: "imperial",
    conversion: { rate: 236.588, to: "milliliter" },
  },
  "fluid ounce": {
    format: defaultF({ long: "fluid ounce", short: "fl oz" }),
    type: "imperial",
    conversion: { rate: 29.5735, to: "milliliter" },
  },
  pint: {
    format: defaultF({ long: "pint", short: "pt" }),
    type: "imperial",
    conversion: { rate: 473.176, to: "milliliter" },
  },
  quart: {
    format: defaultF({ long: "quart", short: "qt" }),
    type: "imperial",
    conversion: { rate: 946.353, to: "milliliter" },
  },
  gallon: {
    format: defaultF({ long: "gallon", short: "gal" }),
    type: "imperial",
    conversion: { rate: 3785.41, to: "milliliter" },
  },
  milliliter: {
    format: defaultF({ long: "milliliter", short: "ml" }),
    type: "metric",
  },
  liter: {
    format: defaultF({ long: "liter", short: "L" }),
    type: "metric",
  },
  deciliter: {
    format: defaultF({ long: "deciliter", short: "dl" }),
    type: "metric",
  },
  centiliter: {
    format: defaultF({ long: "centiliter", short: "cl" }),
    type: "metric",
  },
  gram: {
    format: defaultF({ long: "gram", short: "g" }),
    type: "metric",
  },
  kilogram: {
    format: defaultF({ long: "kilogram", short: "kg" }),
    type: "metric",
  },
  milligram: {
    format: defaultF({ long: "milligram", short: "mg" }),
    type: "metric",
  },
  ounce: {
    format: defaultF({ long: "ounce", short: "oz" }),
    type: "imperial",
    conversion: { rate: 28.3495, to: "gram" },
  },
  pound: {
    format: defaultF({ long: "pound", short: "lb" }),
    type: "imperial",
    conversion: { rate: 453.592, to: "gram" },
  },
  stone: {
    format: defaultF({ long: "stone", short: "st" }),
    type: "imperial",
    conversion: { rate: 6350.29, to: "gram" },
  },
  bushel: {
    format: defaultF({ long: "bushel", short: "bu" }),
    type: "imperial",
    conversion: { rate: 35239.1, to: "milliliter" },
  },
  peck: {
    format: defaultF({ long: "peck", short: "pk" }),
    type: "imperial",
    conversion: { rate: 8809.77, to: "milliliter" },
  },
  gill: {
    format: defaultF({ long: "gill", short: "gi" }),
    type: "imperial",
    conversion: { rate: 118.294, to: "milliliter" },
  },
  dram: {
    format: defaultF({ long: "dram", short: "dr" }),
    type: "imperial",
    conversion: { rate: 3.69669, to: "milliliter" },
  },
  scruple: {
    format: defaultF({ long: "scruple", short: "s" }),
    type: "imperial",
    conversion: { rate: 1.29598, to: "gram" },
  },
  grain: {
    format: defaultF({ long: "grain", short: "gr" }),
    type: "imperial",
    conversion: { rate: 0.0647989, to: "gram" },
  },
  millimeter: {
    format: defaultF({ long: "millimeter", short: "mm" }),
    type: "metric",
  },
  centimeter: {
    format: defaultF({ long: "centimeter", short: "cm" }),
    type: "metric",
  },
  meter: {
    format: defaultF({ long: "meter", short: "m" }),
    type: "metric",
  },
  inch: {
    format: defaultF({ long: "inch", short: "in" }),
    type: "imperial",
    conversion: { rate: 25.4, to: "millimeter" },
  },
  arbitrary: {
    format: {
      long: "arbitrary",
      short: "",
      full: "arbitrary",
      "full-inverted": "arbitrary",
    },
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
  return allUnits.find((it) => it.format.short === short)?.name;
};

export class UnitFormatter {
  constructor(
    private readonly options: {
      style: Style;
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

    return unit.format[this.options.style];
  }

  formatQuantity(quantity: number, name: IngredientUnit | undefined): string {
    if (!name) {
      return quantity.toLocaleString();
    }
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
