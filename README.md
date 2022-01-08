# oak decorators

Project implements decorators like implementation of [Nest.js](https://nestjs.com/) for Deno's web framework [oak](https://github.com/oakserver/oak).

## Usage

The following are the core files that need to be created in the first step.

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

Here's a brief overview of those core files:

| name | description |
|:-|:-|
| `app.module.ts` | The root module of the application. |
| `app.controller.ts` | A basic controller with a single route. |
| `main.ts` | The entry file of the application which uses the core middleware assignModule to use decorations. |

## Docs

### Modules

A module is a class annotated with a `@Module()` decorator. The `@Module()` decorator provides metadata that the application makes use of to organize the application structure.  
Each application has at least one module, a root module, and each modules can have child modules.

The `@Module()` decorator takes those options:

|name|description|
|:-|:-|
| `controllers` | the set of controllers defined in this module which have to be instantiated |
| `providers` | the providers that will be instantiated by the injector |
| `modules` | the set of modules defined as child modules of this module |
| `routePrefix` | the prefix name to be set in route as the common ULR for controllers. |

```typescript
import { Module } from "https://deno.land/x/oak_decorators/mod.ts";
import { AppController } from "./app.controller.ts";
import { SampleModule } from "./sample/sample.module.ts";

@Module({
  modules: [SampleModule],
  controllers: [AppController],
  routePrefix: "v1",
})
export class AppModule {}
```

### Controllers

#### Routing

A controller is a class annotated with a `@Controller()` decorator. Controllers are responsible for handling incoming requests and returning responses to the client.
The `@Controller()` decorator take a route path prefix optionally.

```typescript
import { Controller, Get } from "https://deno.land/x/oak_decorators/mod.ts";

@Controller('sample')
export class SampleController {
  @Get()
  findAll(): string {
    return 'OK';
  }
}

```

The `@Get()` HTTP request method decorator before the `findAll()` method tells the application to create a handler for a specific endpoint for HTTP requests.

For http methods, you can use `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`.

#### Request object

Handlers often need access to the client request details.  
HHere's a example to access the request object using `@Req()` decorator.

```typescript
import { Controller, Get, Req } from "https://deno.land/x/oak_decorators/mod.ts";

@Controller('sample')
export class SampleController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'OK';
  }
}

```

Below is a list of the provided decorators.

|name|
|:-|
| `@Request()`
| `@Response()`
| `@Next()`
| `@Query(key?: string)`
| `@Param(key?: string)`
| `@Body(key?: string)`
| `@Headers(name?: string)`
| `@Ip()`
