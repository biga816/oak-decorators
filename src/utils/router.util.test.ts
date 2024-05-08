import { Reflect } from "deno_reflect";
import { assertExists } from "https://deno.land/std@0.122.0/testing/asserts.ts";
import { Router } from "oak";
import { MODULE_METADATA } from "../const.ts";
import { CreateRouterOption } from "../interfaces/mod.ts";

import { assignModule } from "./router.util.ts";

class TestController {
  path = "";
  route = new Router();
  init() {}
}
class RootModule {}
class ChildModule {}

Deno.test("run assignModule()", () => {
  const option: CreateRouterOption = { controllers: [] };
  Reflect.defineMetadata(MODULE_METADATA, option, RootModule.prototype);

  const middleware = assignModule(RootModule);
  assertExists(middleware);
});

Deno.test("run assignModule() with routePrefix & controllers", () => {
  const option: CreateRouterOption = {
    controllers: [TestController],
    routePrefix: "test",
  };
  Reflect.defineMetadata(MODULE_METADATA, option, RootModule.prototype);

  const middleware = assignModule(RootModule);
  assertExists(middleware);
});

Deno.test("run assignModule() with modules", () => {
  const option: CreateRouterOption = {
    controllers: [],
    modules: [ChildModule],
    routePrefix: "test",
  };
  const childOption: CreateRouterOption = {
    controllers: [TestController],
    routePrefix: "test2",
  };
  Reflect.defineMetadata(MODULE_METADATA, option, RootModule.prototype);
  Reflect.defineMetadata(MODULE_METADATA, childOption, ChildModule.prototype);

  const middleware = assignModule(RootModule);
  assertExists(middleware);
});
