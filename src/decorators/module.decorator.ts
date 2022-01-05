import { Reflect } from "../deps.ts";
import { CreateRouterOption } from "../interfaces/mod.ts";
import { MODULE_METADATA } from "../const.ts";

export function Module<T extends { new (...instance: unknown[]): Object }>(
  data: CreateRouterOption
) {
  return (fn: T): void => {
    Reflect.defineMetadata(MODULE_METADATA, data, fn.prototype);
  };
}
