// Copyright 2018-2024 the oak authors. All rights reserved. MIT license.

/**
 * A collection of APIs to help assist in creating middleware.
 *
 * @module
 */

import type { Context } from "../deps.ts";
import { RouterContext } from "../deps.ts";

interface GetQueryOptionsBase {
  /** The return value should be a `Map` instead of a record object. */
  asMap?: boolean;
}

/** Given a context, return the `.request.url.searchParams` as a `Map` of keys
 * and values of the params. */
export function getQuery(
  ctx: Context | RouterContext<string>,
  options: GetQueryOptionsBase,
): Map<string, string>;
/** Given a context, return the `.request.url.searchParams` as a record object
 * of keys and values of the params. */
export function getQuery(
  ctx: Context | RouterContext<string>,
  options?: GetQueryOptionsBase,
): Record<string, string>;
export function getQuery(
  ctx: Context | RouterContext<string>,
  { asMap }: GetQueryOptionsBase = {},
): Map<string, string> | Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of ctx.request.url.searchParams) {
    result[key] = value;
  }
  return asMap ? new Map(Object.entries(result)) : result;
}
