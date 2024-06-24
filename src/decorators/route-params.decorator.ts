import { RouteParamtypes } from "../enums/mod.ts";
import { registerRouteParamDecorator } from "../utils/router.util.ts";

export function Request(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.REQUEST, property);
}

export function Context(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.CONTEXT, property);
}

export function Response(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.RESPONSE, property);
}

export function Next(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.NEXT, property);
}

export function Query(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.QUERY, property);
}

export function Param(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.PARAM, property);
}

export function Body(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.BODY, property);
}

export function Headers(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.HEADERS, property);
}

export function IP(property?: string): ParameterDecorator {
  return registerRouteParamDecorator(RouteParamtypes.IP, property);
}
