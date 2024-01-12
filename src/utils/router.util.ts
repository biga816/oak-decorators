import { Reflect, Router, bootstrap } from '../deps.ts';

import { MIDDLEWARE_METADATA, MODULE_METADATA } from '../const.ts';
import { CreateRouterOption } from '../interfaces/mod.ts';
import { RouterContext, Next } from 'oak';

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
  target: any,
  methodName: string,
  handler: (ctx: RouterContext, next: Next) => void
) => {
  const middleware =
    Reflect.getMetadata(MIDDLEWARE_METADATA, target, methodName) || [];
  middleware.push(handler);
  Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target, methodName);
};
