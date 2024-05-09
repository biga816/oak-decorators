import { Injectable } from "oak_decorators";

@Injectable()
export class SampleService {
  get() {
    return { value: 123, status: "ok" };
  }
}
