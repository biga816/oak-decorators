import { Controller, Get, Headers } from "ork-decorators";

@Controller()
export class AppController {
  @Get()
  get(@Headers("user-agent") userAgent: string) {
    return { status: "ok", userAgent };
  }
}
