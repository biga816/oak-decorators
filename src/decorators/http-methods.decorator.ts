import { METHOD_METADATA } from "../const.ts";
import { ActionMetadata, HTTPMethods } from "../interfaces/mod.ts";

export const Get = mappingMethod("get");
export const Post = mappingMethod("post");
export const Put = mappingMethod("put");
export const Patch = mappingMethod("patch");
export const Delete = mappingMethod("delete");
export const All = mappingMethod("all");

function mappingMethod(method: HTTPMethods) {
  return (path = "") =>
  (target: object, functionName: string, _: PropertyDescriptor) => {
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
