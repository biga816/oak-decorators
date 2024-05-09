import { Body, Controller, Get, Headers, Post } from "oak_decorators";

@Controller()
export class AppController {
  @Get()
  get(@Headers("user-agent") userAgent: string) {
    return { status: "ok", userAgent };
  }

  @Post()
  post(@Body() body: string) {
    return { status: "ok", body };
  }
}
