export type HTTPMethods = "get" | "put" | "patch" | "post" | "delete";

export interface ActionMetadata {
  path: string;
  method: HTTPMethods;
  functionName: string;
}
