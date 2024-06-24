import { RouterContext } from "../deps.ts";
import { RouteParamtypes } from "../enums/mod.ts";
export interface RouteArgsMetadata<T = unknown> {
  paramtype: RouteParamtypes;
  index: number;
  data?: T;
  // deno-lint-ignore no-explicit-any
  handler?: (data: T, ctx: RouterContext<string>) => any;
}
