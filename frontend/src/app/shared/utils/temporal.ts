export function formatDuration(duration: string): string {
  return Temporal.Duration.from(duration).toLocaleString(undefined, { style: "short" });
}
