import { METHOD_METADATA } from "../const.ts";
import type { ActionMetadata, HTTPMethods } from "../interfaces/mod.ts";
import type { MethodDecorator } from "../utils/router.util.ts";

export const Get: MethodDecorator = mappingMethod("get");
export const Post: MethodDecorator = mappingMethod("post");
export const Put: MethodDecorator = mappingMethod("put");
export const Patch: MethodDecorator = mappingMethod("patch");
export const Delete: MethodDecorator = mappingMethod("delete");
export const All: MethodDecorator = mappingMethod("all");

function mappingMethod(method: HTTPMethods): MethodDecorator {
  return (path = "") => (target: object, functionName: string) => {
    const meta: ActionMetadata = { path, method, functionName };
    addMetadata(meta, target, METHOD_METADATA);
  };
}

function addMetadata<T>(value: T, target: object, key: symbol) {
  const list = Reflect.getMetadata(key, target);
  if (list) {
    list.push(value);
    return;
  }
  Reflect.defineMetadata(key, [value], target);
}
