import { Reflect } from "../../deps.ts";

import { INJECTOR_INTERFACES_METADATA } from "../../const.ts";
import { setInjectionMetadata } from "./injector.ts";

interface InjectionOptions {
  implementing?: string | symbol | string[] | symbol[];
  isSingleton?: boolean;
}

export function Injectable<T>({
  implementing = [],
  isSingleton,
}: InjectionOptions = {}): ClassDecorator {
  const implementings = Array.isArray(implementing)
    ? implementing
    : [implementing];

  return (target: any) => {
    if (implementings.length > 0) {
      Reflect.defineMetadata(
        INJECTOR_INTERFACES_METADATA,
        implementings,
        target
      );
    }

    setInjectionMetadata(target, {
      isSingleton: isSingleton !== false,
    });
  };
}
