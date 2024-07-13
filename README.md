# Oak Decorators

[![jsr.io/@oak/oak](https://jsr.io/badges/@biga816/oak-decorators)](https://jsr.io/@biga816/oak-decorators)
[![deno.land/x/oak](https://deno.land/badge/oak_decorators/version)](https://deno.land/x/oak_decorators)

NestJS-style decorators library for the Deno framework
"[oak](https://github.com/oakserver/oak)".

## TL;DR Key features:

- **Dependency Injection**: Simplify your code and testing process by injecting
  dependencies.
- **Modular Structure**: Organize your code into modules for better scalability
  and maintainability.
- **Decorators**: Configure route endpoint methods in a declarative style.
- **Controller Support**: Define your routes in a declarative way using
  controllers.
- **Custom Middleware Support**: Create middleware decorators to control access
  and flow to routes
- **Custom Middleware Params Support**: Create endpoint parameters decorators
  for parameter injection

## Usage

Define controllers to handle HTTP endpoints

```typescript
// ./controllers/util-controller.ts
import {
  Controller,
  Get,
  Headers,
} from "https://deno.land/x/oak_decorators/mod.ts";

@Controller("util")
export class UtilController {
  @Get("user-agent")
  bounceUserAgent(@Headers("user-agent") userAgent: string) {
    return { status: "ok", userAgent };
  }

  @Get("multiply")
  getRandomStuff(@Query("f1") factor1: number, @Query("f2") factor2: number) {
    return { status: "ok", result: factor1 * factor2 };
  }
}
```

Define modules

```typescript
// ./app.module.ts
import { Module } from "https://deno.land/x/oak_decorators/mod.ts";
import { UtilController } from "./app.controller.ts";

@Module({
  controllers: [UtilController],
  routePrefix: "api/v1",
  modules: [], //optional submodules
})
export class AppModule {}
```

Register an app module with oak.

```typescript
// ./main.ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import { assignModule } from "https://deno.land/x/oak_decorators/mod.ts";
import { AppModule } from "./app.module.ts";

const app = new Application();
app.use(assignModule(AppModule));

await app.listen({ port: 8000 });
```

Run your app and following endpoints will be available:

- `/api/v1/util/user-agent`
- `/api/v1/util/multiply?f1=2&f2=4`

## Docs

### Modules

A module is a class annotated with a `@Module()` decorator. The `@Module()`
decorator provides metadata that the application makes use of to organize the
application structure.\
Each application has at least one module, a root module, and each modules can
have child modules.

The `@Module()` decorator takes those options:

| name          | description                                                                 |
| :------------ | :-------------------------------------------------------------------------- |
| `controllers` | the set of controllers defined in this module which have to be instantiated |
| `providers`   | the providers that will be instantiated by the injector                     |
| `modules`     | the set of modules defined as child modules of this module                  |
| `routePrefix` | the prefix name to be set in route as the common ULR for controllers.       |

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

A controller is a class annotated with a `@Controller()` decorator. Controllers
are responsible for handling incoming requests and returning responses to the
client. The `@Controller()` decorator take a route path prefix optionally.

```typescript
import { Controller, Get } from "https://deno.land/x/oak_decorators/mod.ts";

@Controller("sample")
export class UsersController {
  @Get()
  findAll(): string {
    return "OK";
  }
}
```

The `@Get()` HTTP request method decorator before the `findAll()` method tells
the application to create a handler for a specific endpoint for HTTP requests.

For http methods, you can use `@Get()`, `@Post()`, `@Put()`, `@Patch()`,
`@Delete()`, `@All()`.

#### Request object

Handlers often need access to the client request details.\
HHere's a example to access the request object using `@Req()` decorator.

```typescript
import {
  Controller,
  Get,
  Request,
} from "https://deno.land/x/oak_decorators/mod.ts";

@Controller("sample")
export class SampleController {
  @Get()
  findAll(@Request() request: Request): string {
    return "OK";
  }
}
```

Below is a list of the provided decorators.

| name |
| :--- |

| `@Request()` | `@Response()` | `@Next()` | `@Query(key?: string)` |
`@Param(key?: string)` | `@Body(key?: string)` | `@Headers(name?: string)` |
`@Ip()` | `@Context()`

### Providers

Providers are responsible for main business logic as services, repositories,
factories, helpers, and so on.\
The main idea of a provider is that it can be injected as a dependency.
Depending on the environment, different implementations of a service can be
provided.

```typescript
// ./sample.service.ts
import { Injectable } from "https://deno.land/x/oak_decorators/mod.ts";
import db from "./db-service.ts";

@Injectable()
export class UserService {
  async getAllUsers() {
    const { error, data: users } = await db.users.getAll();
    return { status: "ok", data: users };
  }
}

@Injectable()
export class MockUserService {
  getAllUsers() {
    return {
      status: "ok",
      data: [
        {
          name: "John Doe",
        },
        {
          name: "Jane Doe",
        },
      ],
    };
  }
}

// ./sample.controller.ts
import { Controller, Get } from "https://deno.land/x/oak_decorators/mod.ts";
import { UserService } from "./sample.service.ts";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return await this.userService.getAllUsers();
  }
}

// ./sample.module.ts
import { Module } from "https://deno.land/x/oak_decorators/mod.ts";
import { UsersController } from "./sample.controller.ts";
import { MockUserService, UserService } from "./sample.service.ts";

@Module({
  controllers: [UsersController],
  providers: [
    Deno.env.get("DENO_ENV") === "production" ? UserService : MockUserService,
  ],
})
export class SampleModule {}
```

### Custom Method Decorators

It's possible to register middleware that can be used in controllers by means of
method decorators.

For instance, to protect routes based on user roles, you can create a
`@RequiresRole` method decorator.

```typescript
// ./middleware.ts
import { createMethodDecorator } from "https://deno.land/x/oak_decorators/mod.ts";

function checkUserRoles(roles?: string[]) {
  // Logic to check the user role
  return false;
}

export const RequiresRole = createMethodDecorator<string[]>(
  async (roles, context, next) => {
    // Logic to check the user session or JWT for the required role
    if (checkUserRoles(roles)) {
      await next();
    } else {
      // handle unauthorized access
      context.response.status = 401;
      context.response.body = { error: "Unauthorized" };
      return;
    }
  },
);
```

Then you can use the `@RequiresRole` decorator in your controllers's methods.

```typescript
// ./sample.controller.ts
import RequireRole from "./middleware.ts";

@Controller("users")
export default class SampleController {
  @Get("/")
  @RequiresRole(["admin"])
  getAllUsers() {
    // Logic to get all users
  }
}
```

### Custom Parameters Decorator

It's also possible to register custom parameters decorators to streamline data
injection into endpoint handlers

It would be useful to have a shortcut to some data stored in the request's JWT.

The approach would involve having a high priority controller that parses the JWT
and stores it in `context.state.jwtData`.

Then a param decorator could be defined as follows:

```typescript
import { createParamDecorator } from "https://deno.land/x/oak_decorators/mod.ts";

export const JWT = createParamDecorator<string>(
  (data, ctx) => {
    return data ? ctx.state.jwtData?.[data] : ctx.state.jwtData;
  },
);
```

And used in controllers like this:

```typescript
//sample-controller

@Get('my-subscriptions')
getUserSubscriptions(@JWT('sub') userId : string) {
  return await databaseService.getUserSubscriptions(userId);
}
```

Params resolution is asynchronous, so it is also possible to do things like
retrieving session information from KV stores on demand. This would be a more
efficient strategy than having a middleware that always retrieves session data
if this is not desirable.

```typescript
export const SessionData = createParamDecorator<undefined>(
  async (_data, ctx) => {
    return ctx.state.jwtData?.sid
      ? await retrieveSession(ctx.state.jwtData?.sid)
      : null;
  },
);
```

```typescript
//sample-controller

@Get('my-recent-products')
getUserSubscriptions(@SessionData() sessionData : any) {
  return sessionData.recentProducts
}
```
