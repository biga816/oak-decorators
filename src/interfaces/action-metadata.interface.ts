export type HTTPMethods = "get" | "put" | "patch" | "post" | "delete" | "all";

export interface ActionMetadata {
  path: string;
  method: HTTPMethods;
  functionName: string;
}
