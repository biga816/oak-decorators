import { Reflect, Router, bootstrap } from '../deps.ts';

import { MIDDLEWARE_METADATA, MODULE_METADATA } from '../const.ts';
import { CreateRouterOption } from '../interfaces/mod.ts';
import { RouterContext, Next } from 'oak';
import { ParamData } from '../interfaces/mod.ts';
import { RouteArgsMetadata } from '../interfaces/mod.ts';
import { ROUTE_ARGS_METADATA } from '../const.ts';
import { RouteParamtypes } from '../enums/mod.ts';
import { ClassConstructor } from '../types.ts';

export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined';
export const isString = (fn: any): fn is string => typeof fn === 'string';
export const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null;

const createRouter = (
  { controllers, providers, routePrefix }: CreateRouterOption,
  prefix?: string,
  router = new Router()
) => {
  controllers.forEach((Controller) => {
    Reflect.defineMetadata('design:paramtypes', providers, Controller);
    const controller = bootstrap<any>(Controller);
    const prefixFull = prefix
      ? prefix + (routePrefix ? `/${routePrefix}` : '')
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
    module.prototype
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
  handler: (ctx: RouterContext, next: Next) => void
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
  paramIndex: number
) => {
  return (data?: ParamData) =>
    (handler: (ctx: RouterContext<string>) => void) => {
      const args: RouteArgsMetadata[] =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target, methodName) || [];
      const hasParamData = isNil(data) || isString(data);
      const paramData = hasParamData ? data : undefined;

      args.push({
        paramtype: RouteParamtypes.CUSTOM,
        index: paramIndex,
        data: paramData,
        handler,
      });

      Reflect.defineMetadata(ROUTE_ARGS_METADATA, args, target, methodName);
    };
};
