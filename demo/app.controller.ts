import { Controller, Get, Headers } from "oak_decorators";

@Controller()
export class AppController {
  @Get()
  get(@Headers("user-agent") userAgent: string) {
    return { status: "ok", userAgent };
  }
}
