import { describe, expect, it } from "vitest";
import type { Custom, DecimalAmount, Interval, Unspecified } from "@/shared/server";
import { formatQuantity, parseQuantity } from "@/shared/utils/unit";

function isCustomUnit(unit: { type: string }): unit is Custom {
  return unit.type === "custom";
}

describe("parseQuantity", () => {
  describe("decimal quantities", () => {
    it("parses standard mass unit: grams", () => {
      const result = parseQuantity("12.5 g");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(12.5);
      expect((result as DecimalAmount).unit.type).toBe("gram");
    });

    it("parses standard mass unit: kilograms", () => {
      const result = parseQuantity("2 kg");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(2);
      expect((result as DecimalAmount).unit.type).toBe("kilogram");
    });

    it("parses standard volume unit: milliliters", () => {
      const result = parseQuantity("250 ml");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(250);
      expect((result as DecimalAmount).unit.type).toBe("milliliter");
    });

    it("parses standard volume unit: liters", () => {
      const result = parseQuantity("1.5 l");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(1.5);
      expect((result as DecimalAmount).unit.type).toBe("liter");
    });

    it("parses no space between number and unit", () => {
      const result = parseQuantity("14ml");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(14);
      expect((result as DecimalAmount).unit.type).toBe("milliliter");
    });

    it("parses number only as arbitrary", () => {
      const result = parseQuantity("5");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(5);
      expect((result as DecimalAmount).unit.type).toBe("arbitrary");
    });

    it("parses decimal number only as arbitrary", () => {
      const result = parseQuantity("0.5");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(0.5);
      expect((result as DecimalAmount).unit.type).toBe("arbitrary");
    });

    it("parses custom unit as custom", () => {
      const result = parseQuantity("4 parts");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(4);
      expect((result as DecimalAmount).unit.type).toBe("custom");
      const unit = (result as DecimalAmount).unit;
      if (isCustomUnit(unit)) {
        expect(unit.name).toBe("parts");
      }
    });

    it("parses multi-word custom unit", () => {
      const result = parseQuantity("2 slices of bread");
      expect(result.type).toBe("decimal");
      expect((result as DecimalAmount).amount).toBe(2);
      expect((result as DecimalAmount).unit.type).toBe("custom");
      const unit = (result as DecimalAmount).unit;
      if (isCustomUnit(unit)) {
        expect(unit.name).toBe("slices of bread");
      }
    });
  });

  describe("interval quantities", () => {
    it("parses interval with hyphen separator", () => {
      const result = parseQuantity("13-15 g");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(13);
      expect((result as Interval).to).toBe(15);
      expect((result as Interval).unit.type).toBe("gram");
    });

    it("parses interval with en-dash separator", () => {
      const result = parseQuantity("10–20 ml"); // en-dash
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(10);
      expect((result as Interval).to).toBe(20);
      expect((result as Interval).unit.type).toBe("milliliter");
    });

    it("parses interval with 'to' separator", () => {
      const result = parseQuantity("10 to 20 ml");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(10);
      expect((result as Interval).to).toBe(20);
      expect((result as Interval).unit.type).toBe("milliliter");
    });

    it("parses interval with tilde separator", () => {
      const result = parseQuantity("5~10 kg");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(5);
      expect((result as Interval).to).toBe(10);
      expect((result as Interval).unit.type).toBe("kilogram");
    });

    it("parses interval with spaces around hyphen", () => {
      const result = parseQuantity("3 - 5 l");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(3);
      expect((result as Interval).to).toBe(5);
      expect((result as Interval).unit.type).toBe("liter");
    });

    it("parses interval number only as arbitrary", () => {
      const result = parseQuantity("10-20");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(10);
      expect((result as Interval).to).toBe(20);
      expect((result as Interval).unit.type).toBe("arbitrary");
    });

    it("parses interval with custom unit", () => {
      const result = parseQuantity("3-5 parts");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(3);
      expect((result as Interval).to).toBe(5);
      expect((result as Interval).unit.type).toBe("custom");
      const unit = (result as Interval).unit;
      if (isCustomUnit(unit)) {
        expect(unit.name).toBe("parts");
      }
    });

    it("parses interval with multi-word custom unit", () => {
      const result = parseQuantity("2-4 cloves of garlic");
      expect(result.type).toBe("interval");
      expect((result as Interval).from).toBe(2);
      expect((result as Interval).to).toBe(4);
      expect((result as Interval).unit.type).toBe("custom");
      const unit = (result as Interval).unit;
      if (isCustomUnit(unit)) {
        expect(unit.name).toBe("cloves of garlic");
      }
    });
  });

  describe("unspecified quantities (free text)", () => {
    it("parses free text without number as unspecified", () => {
      const result = parseQuantity("a handful");
      expect(result.type).toBe("unspecified");
      expect((result as Unspecified).notes).toBe("a handful");
    });

    it("parses 'to taste' as unspecified", () => {
      const result = parseQuantity("to taste");
      expect(result.type).toBe("unspecified");
      expect((result as Unspecified).notes).toBe("to taste");
    });

    it("parses 'pinch of salt' as unspecified", () => {
      const result = parseQuantity("pinch of salt");
      expect(result.type).toBe("unspecified");
      expect((result as Unspecified).notes).toBe("pinch of salt");
    });

    it("trims whitespace", () => {
      const result = parseQuantity("  a handful  ");
      expect(result.type).toBe("unspecified");
      expect((result as Unspecified).notes).toBe("a handful");
    });
  });

  describe("unit aliases", () => {
    it("parses 'grams' alias", () => {
      const result = parseQuantity("100 grams");
      expect((result as DecimalAmount).unit.type).toBe("gram");
    });

    it("parses 'kilograms' alias", () => {
      const result = parseQuantity("1 kilograms");
      expect((result as DecimalAmount).unit.type).toBe("kilogram");
    });

    it("parses 'kilo' alias", () => {
      const result = parseQuantity("2 kilo");
      expect((result as DecimalAmount).unit.type).toBe("kilogram");
    });

    it("parses 'milliliters' alias", () => {
      const result = parseQuantity("500 milliliters");
      expect((result as DecimalAmount).unit.type).toBe("milliliter");
    });

    it("parses 'litre' alias", () => {
      const result = parseQuantity("1 litre");
      expect((result as DecimalAmount).unit.type).toBe("liter");
    });

    it("parses 'litres' alias", () => {
      const result = parseQuantity("2 litres");
      expect((result as DecimalAmount).unit.type).toBe("liter");
    });

    it("parses 'cc' alias for milliliter", () => {
      const result = parseQuantity("5 cc");
      expect((result as DecimalAmount).unit.type).toBe("milliliter");
    });
  });

  describe("error cases", () => {
    it("throws on empty string", () => {
      expect(() => parseQuantity("")).toThrow("Cannot parse empty quantity text");
    });

    it("throws on whitespace-only string", () => {
      expect(() => parseQuantity("   ")).toThrow("Cannot parse empty quantity text");
    });
  });
});

describe("formatQuantity", () => {
  describe("decimal quantities", () => {
    it("formats standard mass unit with short display", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 12.5,
        unit: { type: "gram" },
      };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("12.5 g");
    });

    it("formats standard mass unit with long display", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 12.5,
        unit: { type: "gram" },
      };
      expect(formatQuantity(q, { unitDisplay: "long" })).toBe("12.5 grams");
    });

    it("formats standard volume unit", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 250,
        unit: { type: "milliliter" },
      };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("250 ml");
    });

    it("formats arbitrary unit (no unit display)", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 5,
        unit: { type: "arbitrary" },
      };
      expect(formatQuantity(q)).toBe("5");
    });

    it("formats custom unit", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 4,
        unit: { type: "custom", name: "parts" },
      };
      expect(formatQuantity(q)).toBe("4 parts");
    });

    it("formats number without decimals cleanly", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 10,
        unit: { type: "gram" },
      };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("10 g");
    });

    it("formats decimal numbers with appropriate precision", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 0.3333333333,
        unit: { type: "gram" },
      };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("0.3333333333 g");
    });

    it("formats removes trailing zeros", () => {
      const q: DecimalAmount = {
        type: "decimal",
        amount: 2.0,
        unit: { type: "gram" },
      };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("2 g");
    });
  });

  describe("interval quantities", () => {
    it("formats interval with standard unit", () => {
      const q: Interval = { type: "interval", from: 13, to: 15, unit: { type: "gram" } };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("13 - 15 g");
    });

    it("formats interval with custom unit", () => {
      const q: Interval = {
        type: "interval",
        from: 3,
        to: 5,
        unit: { type: "custom", name: "parts" },
      };
      expect(formatQuantity(q)).toBe("3 - 5 parts");
    });

    it("formats interval as arbitrary", () => {
      const q: Interval = { type: "interval", from: 10, to: 20, unit: { type: "arbitrary" } };
      expect(formatQuantity(q)).toBe("10 - 20");
    });

    it("formats interval with decimal values", () => {
      const q: Interval = { type: "interval", from: 0.5, to: 1.5, unit: { type: "liter" } };
      expect(formatQuantity(q, { unitDisplay: "short" })).toBe("0.5 - 1.5 l");
    });
  });

  describe("unspecified quantities", () => {
    it("formats unspecified as-is", () => {
      const q: Unspecified = { type: "unspecified", notes: "a handful" };
      expect(formatQuantity(q)).toBe("a handful");
    });

    it("formats 'to taste'", () => {
      const q: Unspecified = { type: "unspecified", notes: "to taste" };
      expect(formatQuantity(q)).toBe("to taste");
    });
  });
});

describe("round-trip: parse → format", () => {
  it("round-trips decimal standard unit", () => {
    const original = "12.5 g";
    const parsed = parseQuantity(original);
    const formatted = formatQuantity(parsed, { unitDisplay: "short" });
    expect(formatted).toBe(original);
  });

  it("round-trips decimal custom unit", () => {
    const original = "4 parts";
    const parsed = parseQuantity(original);
    const formatted = formatQuantity(parsed);
    expect(formatted).toBe(original);
  });

  it("round-trips interval standard unit", () => {
    const original = "13 - 15 g";
    const parsed = parseQuantity("13-15 g");
    const formatted = formatQuantity(parsed, { unitDisplay: "short" });
    expect(formatted).toBe(original);
  });

  it("round-trips interval custom unit", () => {
    const original = "3 - 5 parts";
    const parsed = parseQuantity("3-5 parts");
    const formatted = formatQuantity(parsed);
    expect(formatted).toBe(original);
  });

  it("round-trips unspecified", () => {
    const original = "a handful";
    const parsed = parseQuantity(original);
    const formatted = formatQuantity(parsed);
    expect(formatted).toBe(original);
  });
});
