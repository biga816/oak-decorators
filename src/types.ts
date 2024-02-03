//deno-lint-ignore no-explicit-any
export type ClassConstructor<T = object> = new (...args: any[]) => T;
