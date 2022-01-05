import { RouteParamtypes } from "../enums/mod.ts";
export type ParamData = Record<string, unknown> | string | number;

export interface RouteArgsMetadata {
  paramtype: RouteParamtypes;
  index: number;
  data?: ParamData;
}
