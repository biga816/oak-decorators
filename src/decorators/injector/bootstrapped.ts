import { Constructor } from "./mod.ts";

export function Bootstrapped<T>() {
  return (_: Constructor<T>): void => {};
}
