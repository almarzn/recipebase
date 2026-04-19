import type { Quantity } from "@/shared/models";

export const formatQuantity = (
  quantity: Quantity,
  options: Partial<{
    unitDisplay: "short" | "long" | "narrow" | undefined;
  }>,
) => {
  const format = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: quantity.unit,
    unitDisplay: "long",
    ...options,
  });

  return format.format(quantity.value);
};
