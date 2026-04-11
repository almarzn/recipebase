import { toSignal } from "@angular/core/rxjs-interop";
import type { Observable } from "rxjs";

export function externalSignal<T>(
  read: () => T,
  write: (value: T) => void,
  source$: Observable<T>,
): (() => T | undefined) & { set: (v: T) => void; update: (fn: (v: T) => T) => void } {
  const inner = toSignal(source$, { initialValue: read() });

  return Object.assign(() => inner(), {
    set: (v: T) => write(v),
    update: (fn: (v: T) => T) => write(fn(inner())),
  });
}
