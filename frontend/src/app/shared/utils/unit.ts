import type { Quantity } from "@/shared/models";

export const formatQuantity = (
  quantity: Quantity,
  options: Partial<{
    unitDisplay: "short" | "long" | "narrow" | undefined;
  }>,
) => {
  if (quantity.unit === "unspecified") {
    return quantity.notes.toString();
  }

  if (!("amount" in quantity) || typeof quantity.amount !== "number") {
    throw new Error(`Unexpected quantity without amount: ${JSON.stringify(quantity)}`);
  }

  if (quantity.unit === "arbitrary") {
    return new Intl.NumberFormat(undefined, {
      ...options,
    }).format(quantity.amount);
  }

  const format = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: quantity.unit,
    unitDisplay: "long",
    ...options,
  });

  return format.format(quantity.amount);
};
