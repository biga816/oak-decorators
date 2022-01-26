import { Injectable } from "ork_decorators";

@Injectable()
export class SampleService {
  get() {
    return { value: 123, status: "ok" };
  }
}
