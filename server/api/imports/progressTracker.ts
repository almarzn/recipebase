export type ReportProgressInc = (inc?: number) => void;

export const subProgress = (
  report: ReportProgressInc,
  maxTick: number,
): ReportProgressInc => {
  return (inc = 1) => {
    report(inc / maxTick);
  };
};

export const incProgress =
  (progress: ReportProgressInc) =>
  <T>(el: T) => {
    progress();
    return el;
  };
