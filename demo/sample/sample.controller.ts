import { Body, Controller, Get, IP, Param, Post, Query } from "oak_decorators";
import { SampleService } from "./sample.service.ts";

@Controller()
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  get() {
    return this.sampleService.get();
  }

  @Post()
  post(@Body() body: any) {
    return body;
  }

  @Get("test/:id")
  test(@Param("id") id: string, @Query() test: any, @IP() ip: string) {
    return { id, ...test, ip };
  }
}
