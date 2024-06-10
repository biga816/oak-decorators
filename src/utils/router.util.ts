// deno-lint-ignore-file no-explicit-any
import { Next, Reflect, Router, RouterContext } from "../deps.ts";
import { bootstrap } from "../mod.ts";

import {
  CONTROLLER_METADATA,
  INJECTOR_INTERFACES_METADATA,
  MIDDLEWARE_METADATA,
  MODULE_METADATA,
  ROUTE_ARGS_METADATA,
} from "../const.ts";
import { RouteParamtypes } from "../enums/mod.ts";
import {
  CreateRouterOption,
  ParamData,
  RouteArgsMetadata,
} from "../interfaces/mod.ts";
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

/**
 * Registers a decorator that can be added to a controller's
 * method. The handler will be called at runtime when the
 * endpoint method is invoked with the Context and Next parameters.
 *
 * @param target decorator's target
 * @param methodName decorator's method name
 * @param handler decorator's handler
 */
export const registerMiddlewareMethodDecorator = (
  target: ClassConstructor,
  methodName: string,
  handler: (
    ctx: RouterContext<any, Record<string, any>, any>,
    next: Next,
  ) => void,
) => {
  const middleware =
    Reflect.getMetadata(MIDDLEWARE_METADATA, target, methodName) || [];
  middleware.push(handler);
  Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target, methodName);
};

/**
 * Registers a custom route parameter decorator.
 *
 * @param {ClassConstructor} target - the target object
 * @param {string} methodName - the name of the method
 * @param {number} paramIndex - the index of the parameter
 * @return {(data?: ParamData) => (handler: (ctx: RouterContext<string>) => void) => void} a function that takes optional data and returns a function that requires the param's handler as only parameter
 */
export const registerCustomRouteParamDecorator = (
  target: ClassConstructor,
  methodName: string,
  paramIndex: number,
) => {
  return ((handler: (ctx: RouterContext<string>) => void) => {
    const args: RouteArgsMetadata[] =
      Reflect.getMetadata(ROUTE_ARGS_METADATA, target, methodName) || [];

    args.push({
      paramtype: RouteParamtypes.CUSTOM,
      index: paramIndex,
      data: undefined,
      handler,
    });

    Reflect.defineMetadata(ROUTE_ARGS_METADATA, args, target, methodName);
  });
};
