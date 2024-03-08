// deno-lint-ignore-file no-explicit-any
import { Reflect, Router, RouterContext, helpers } from '../deps.ts';
import logger from '../utils/logger.ts';
import { ActionMetadata, RouteArgsMetadata } from '../interfaces/mod.ts';
import { RouteParamtypes } from '../enums/mod.ts';
import {
  METHOD_METADATA,
  MIDDLEWARE_METADATA,
  ROUTE_ARGS_METADATA,
  CONTROLLER_METADATA,
} from '../const.ts';

type Next = () => Promise<unknown>;

export function Controller<T extends { new (...instance: any[]): Object }>(
  options?:
    | string
    | {
        path?: string;
        injectables: Array<string | symbol | null>;
      }
) {
  const path: string | undefined =
    typeof options === 'string' ? options : options?.path;
  const injectables =
    typeof options === 'string' ? [] : options?.injectables || [];

  return (fn: T): any => {
    Reflect.defineMetadata(CONTROLLER_METADATA, { injectables }, fn);
    return class extends fn {
      private _path?: string;
      private _route?: Router;

      init(routePrefix?: string) {
        const prefix = routePrefix ? `/${routePrefix}` : '';
        this._path = prefix + (path ? `/${path}` : '');
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

          const middlewaresMetadata = Reflect.getMetadata(
            MIDDLEWARE_METADATA,
            fn.prototype,
            meta.functionName
          );
          const middlewares = Array.isArray(middlewaresMetadata)
            ? middlewaresMetadata
            : middlewaresMetadata
            ? [middlewaresMetadata]
            : [];

          (route as any)[meta.method](
            `/${meta.path}`,
            ...middlewares,
            async (context: RouterContext<string>, next: Next) => {
              const inputs = await Promise.all(
                argsMetadataList
                  .sort((a, b) => a.index - b.index)
                  .map(async (data) => getContextData(data, context, next))
              );
              const result = await (this as any)[meta.functionName](...inputs);
              if (result === undefined) return;

              if (context.response.writable) {
                context.response.body = result;
              } else {
                logger.warn(`Response is not writable`);
              }
            }
          );

          const fullPath = this.path + (meta.path ? `/${meta.path}` : '');
          logger.info(`Mapped: [${meta.method.toUpperCase()}]${fullPath}`);
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
    case RouteParamtypes.CONTEXT: {
      return ctx;
    }
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
    case RouteParamtypes.CUSTOM: {
      return await args.handler!(ctx, data);
    }
    default:
      return;
  }
}
