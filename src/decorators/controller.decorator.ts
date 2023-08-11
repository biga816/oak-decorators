// deno-lint-ignore-file no-explicit-any
import { Reflect, Router, RouterContext, helpers } from "../deps.ts";

import { ActionMetadata, RouteArgsMetadata } from "../interfaces/mod.ts";
import { RouteParamtypes } from "../enums/mod.ts";
import { METHOD_METADATA, ROUTE_ARGS_METADATA } from "../const.ts";

type Next = () => Promise<unknown>;

export function Controller<T extends { new (...instance: any[]): Object }>(
  path?: string
) {
  return (fn: T): any =>
    class extends fn {
      private _path?: string;
      private _route?: Router;

      init(routePrefix?: string) {
        const prefix = routePrefix ? `/${routePrefix}` : "";
        this._path = prefix + (path ? `/${path}` : "");
        const route = new Router();
        const list: ActionMetadata[] =
          Reflect.getMetadata(METHOD_METADATA, fn.prototype) || [];

        list.forEach((meta) => {
          const argsMetadataList: RouteArgsMetadata[] =
            Reflect.getMetadata(
              ROUTE_ARGS_METADATA,
              fn.prototype,
              meta.functionName
            ) || [];

          (route as any)[meta.method](
            `/${meta.path}`,
            async (context: RouterContext<string>, next: Next) => {
              const inputs = await Promise.all(
                argsMetadataList
                  .sort((a, b) => a.index - b.index)
                  .map(async (data) => getContextData(data, context, next))
              );
              context.response.body = await (this as any)[meta.functionName](
                ...inputs
              );
            }
          );

          const fullPath = this.path + (meta.path ? `/${meta.path}` : "");
          console.log(`Mapped: [${meta.method.toUpperCase()}]${fullPath}`);
        });

        this._route = route;
      }

      get path(): string | undefined {
        return this._path;
      }

      get route(): Router | undefined {
        return this._route;
      }
    };
}

async function getContextData(
  args: RouteArgsMetadata,
  ctx: RouterContext<string>,
  next: Next
) {
  const { paramtype, data } = args;
  const req = ctx.request;
  const res = ctx.response;

  switch (paramtype) {
    case RouteParamtypes.REQUEST: {
      return req;
    }
    case RouteParamtypes.RESPONSE: {
      return res;
    }
    case RouteParamtypes.NEXT: {
      return next;
    }
    case RouteParamtypes.QUERY: {
      const query = helpers.getQuery(ctx);
      return data ? query[data.toString()] : query;
    }
    case RouteParamtypes.PARAM: {
      const params = ctx.params;
      return data ? params[data.toString()] : params;
    }
    case RouteParamtypes.BODY: {
      const value = await req.body().value;
      return data ? value[data.toString()] : value;
    }
    case RouteParamtypes.HEADERS: {
      const header: Headers = req.headers;
      return data ? header.get(data.toString()) : Object.fromEntries(header);
    }
    case RouteParamtypes.IP: {
      return req.ip;
    }
    default:
      return;
  }
}
