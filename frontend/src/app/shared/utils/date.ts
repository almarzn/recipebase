const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  const pdt = Temporal.PlainDateTime.from(iso.endsWith("Z") ? iso.slice(0, -1) : iso);
  return `${MONTH_NAMES[pdt.month - 1]} ${pdt.day}, ${pdt.year}`;
}
