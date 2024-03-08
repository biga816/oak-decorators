import { Reflect } from '../deps.ts';

import { InjectionOptions } from 'https://deno.land/x/inject@v0.1.2/decorators.ts';
import { Injectable as OriginalInjectable } from 'https://deno.land/x/inject@v0.1.2/mod.ts';
import { INJECTOR_INTERFACES_METADATA } from '../const.ts';

export function Injectable({
  implementing = [],
  ...originalOptions
}: {
  implementing?: string | string[];
} & InjectionOptions = {}): ClassDecorator {
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
    return OriginalInjectable({ ...originalOptions })(target);
  };
}
