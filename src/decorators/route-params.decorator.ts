import { ROUTE_ARGS_METADATA } from "../const.ts";
import { Reflect } from "../deps.ts";
import { RouteParamtypes } from "../enums/mod.ts";
import { ParamData, RouteArgsMetadata } from "../interfaces/mod.ts";
import { isNil, isString } from "../utils/router.util.ts";

function createPipesRouteParamDecorator(paramtype: RouteParamtypes) {
  return (data?: ParamData): ParameterDecorator =>
    (target, key, index) => {
      if (!key) return;
      const args: RouteArgsMetadata[] =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target, key) || [];
      const hasParamData = isNil(data) || isString(data);
      const paramData = hasParamData ? data : undefined;

      args.push({
        paramtype,
        index,
        data: paramData,
      });

      Reflect.defineMetadata(ROUTE_ARGS_METADATA, args, target, key);
    };
}

export function Request(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.REQUEST)(property);
}

export function Context(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.CONTEXT)(property);
}

export function Response(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.RESPONSE)(property);
}

export function Next(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.NEXT)(property);
}

export function Query(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.QUERY)(property);
}

export function Param(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.PARAM)(property);
}

export function Body(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.BODY)(property);
}

export function Headers(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.HEADERS)(property);
}

export function IP(property?: string): ParameterDecorator {
  return createPipesRouteParamDecorator(RouteParamtypes.IP)(property);
}
