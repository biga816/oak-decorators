import { Module } from "ork_decorators";
import { SampleController } from "./sample.controller.ts";
import { SampleService } from "./sample.service.ts";

@Module({
  controllers: [SampleController],
  providers: [SampleService],
  routePrefix: "sample",
})
export class SampleModule {}
