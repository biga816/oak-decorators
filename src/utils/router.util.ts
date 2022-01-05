import { Reflect, Router, bootstrap } from "../deps.ts";

import { MODULE_METADATA } from "../const.ts";
import { CreateRouterOption } from "../interfaces/mod.ts";

const createRouter = (
  { controllers, providers, routePrefix }: CreateRouterOption,
  prefix?: string,
  router = new Router()
) => {
  controllers.forEach((Controller) => {
    Reflect.defineMetadata("design:paramtypes", providers, Controller);
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
