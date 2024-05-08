import { ClassConstructor } from "../types.ts";

export interface CreateRouterOption {
  controllers: ClassConstructor[];
  providers?: ClassConstructor[];
  modules?: ClassConstructor[];
  routePrefix?: string;
}
