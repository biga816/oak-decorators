import { assertExists } from "jsr:@std/assert@1.0.0";
import { MODULE_METADATA } from "../const.ts";
import { Router } from "../deps.ts";
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
