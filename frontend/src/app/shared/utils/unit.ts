import type { Quantity } from "@/shared/models";

export const formatQuantity = (
  quantity: Quantity,
  options: Partial<{
    unitDisplay: "short" | "long" | "narrow" | undefined;
  }>,
) => {
  if (quantity.unit === "unspecified") {
    return quantity.notes;
  }

  const format = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: quantity.unit,
    unitDisplay: "long",
    ...options,
  });

  return format.format(quantity.amount);
};
