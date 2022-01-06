import { Controller, Get, Post, Query, Param, Body } from "ork_decorators";
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
  test(@Param("id") id: string, @Query() test: any) {
    return { id, ...test };
  }
}
