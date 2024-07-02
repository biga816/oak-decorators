// deno-lint-ignore-file no-explicit-any
import { Context, Next, Reflect, Router, RouterContext } from "../deps.ts";
import { bootstrap } from "../mod.ts";

import {
  CONTROLLER_METADATA,
  INJECTOR_INTERFACES_METADATA,
  MIDDLEWARE_METADATA,
  MODULE_METADATA,
  ROUTE_ARGS_METADATA,
} from "../const.ts";
import { RouteParamtypes } from "../enums/mod.ts";
import { CreateRouterOption, RouteArgsMetadata } from "../interfaces/mod.ts";
import { ClassConstructor } from "../types.ts";

export const isUndefined = (obj: unknown): obj is undefined =>
  typeof obj === "undefined";
export const isString = (fn: unknown): fn is string => typeof fn === "string";
export const isNil = (obj: unknown): obj is null | undefined =>
  isUndefined(obj) || obj === null;

const createRouter = (
  { controllers, providers = [], routePrefix }: CreateRouterOption,
  prefix?: string,
  router = new Router(),
) => {
  controllers.forEach((Controller) => {
    const requiredProviders = (
      Reflect.getMetadata(
        "design:paramtypes",
        Object.getPrototypeOf(Controller),
      ) || []
    ).map((requiredProvider: ClassConstructor, idx: number) => {
      const { injectables } = Reflect.getMetadata(
        CONTROLLER_METADATA,
        Controller,
      ) || { injectables: [] };
      const provider = providers.find((provider) => {
        const implementing =
          Reflect.getMetadata(INJECTOR_INTERFACES_METADATA, provider) || [];
        return (
          provider === requiredProvider ||
          Object.prototype.isPrototypeOf.call(
            provider.prototype,
            requiredProvider.prototype,
          ) ||
          implementing.includes(injectables[idx])
        );
      });
      if (!provider) {
        throw new Error(
          `Provider of type ${requiredProvider.name} not found for controller: ${
            Object.getPrototypeOf(Controller).name
          }`,
        );
      }
      return provider;
    });

    Reflect.defineMetadata("design:paramtypes", requiredProviders, Controller);

    const controller = bootstrap<any>(Controller);
    const prefixFull = prefix
      ? prefix + (routePrefix ? `/${routePrefix}` : "")
      : routePrefix;
    controller.init(prefixFull);
    const path = controller.path;
    const route = controller.route;
    router.use(path, route.routes(), route.allowedMethods());
  });
  return router;
};

const getRouter = (module: any, prefix?: string, router?: Router) => {
  const mainModuleOption: CreateRouterOption = Reflect.getMetadata(
    MODULE_METADATA,
    module.prototype,
  );

  const newRouter = createRouter(mainModuleOption, prefix, router);

  mainModuleOption.modules?.map((module) =>
    getRouter(module, mainModuleOption.routePrefix, newRouter)
  ) || [];

  return newRouter;
};

export const assignModule = (module: any) => {
  const router = getRouter(module);
  return router.routes();
};

export const createMethodDecorator = <T = string>(
  handler: (
    data: T | undefined,
    ctx: RouterContext<any, Record<string, any>, any>,
    next: Next,
  ) => void,
) => {
  return ((data?: T) => (target: unknown, methodName: string) => {
    const middleware =
      Reflect.getMetadata(MIDDLEWARE_METADATA, target, methodName) || [];
    middleware.push((
      context: RouterContext<any, Record<string, any>, any>,
      next: Next,
    ) => handler(data, context, next));
    Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target, methodName);
  });
};

export const createParamDecorator = <T = string>(
  handler: (data: T | undefined, ctx: Context) => any,
) =>
(data?: T) =>
  registerRouteParamDecorator(
    RouteParamtypes.CUSTOM,
    data,
    handler,
  );

export const registerRouteParamDecorator = <T>(
  paramtype: RouteParamtypes,
  data: T | undefined,
  handler: (data: T, ctx: RouterContext<string>) => void,
): ParameterDecorator => {
  return (target, key, index) => {
    if (!key) return;
    const args: RouteArgsMetadata<T>[] =
      Reflect.getMetadata(ROUTE_ARGS_METADATA, target, key) || [];
    const hasParamData = isNil(data) || isString(data);
    const paramData = hasParamData ? data : undefined;

    args.push({
      paramtype,
      index,
      data: paramData,
      handler,
    });

    Reflect.defineMetadata(ROUTE_ARGS_METADATA, args, target, key);
  };
};
