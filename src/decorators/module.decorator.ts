import { Reflect } from "deno_reflect";
import { MODULE_METADATA } from "../const.ts";
import { CreateRouterOption } from "../interfaces/mod.ts";
import { ClassConstructor } from "../types.ts";

export function Module<T>(
  data: CreateRouterOption,
): (target: ClassConstructor<T>) => void {
  return (target: ClassConstructor<T>) => {
    Reflect.defineMetadata(MODULE_METADATA, data, target.prototype);
  };
}
