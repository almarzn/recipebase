import type { Tracker, type TrackerGroup } from "are-we-there-yet";

export const startTracker = (tracker: TrackerGroup | Tracker) => {
  tracker.emit("change", undefined, tracker.completed(), tracker);
};
