import { Injectable } from "ork-decorators";

@Injectable()
export class SampleService {
  get() {
    return { value: 123, status: "ok" };
  }
}
