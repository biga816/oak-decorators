# oak decorators

Project implements decorators for oak like Nest.js.

## Usage

```typescript
// ./main.ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import { assignModule } from "https://deno.land/x/oak_decorators/mod.ts";
import { AppModule } from "./app.module.ts";

const app = new Application();
app.use(assignModule(AppModule));

await app.listen({ port: 8000 });
```

```typescript
// ./app.module.ts
import { Module } from "https://deno.land/x/oak_decorators/mod.ts";
import { AppController } from "./app.controller.ts";

@Module({
  controllers: [AppController],
  routePrefix: "v1",
})
export class AppModule {}
```

```typescript
// ./app.controller.ts
import { Controller, Get, Headers } from "https://deno.land/x/oak_decorators/mod.ts";

@Controller()
export class AppController {
  @Get()
  get(@Headers("user-agent") userAgent: string) {
    return { status: "ok", userAgent };
  }
}
```