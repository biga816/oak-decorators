import type { Constructor } from "./mod.ts";

export function Bootstrapped<T>(): (_: Constructor<T>) => void {
  return (_: Constructor<T>): void => {};
}
