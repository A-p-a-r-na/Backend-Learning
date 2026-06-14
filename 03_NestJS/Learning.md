# NestJS — A Detailed Guide

---

## Table of Contents

1. [What is NestJS?](#1-what-is-nestjs)
2. [Why NestJS over Express?](#2-why-nestjs-over-express)
3. [Installation & Project Setup](#3-installation--project-setup)
4. [Project Structure](#4-project-structure)
5. [Modules](#5-modules)
6. [Controllers](#6-controllers)
7. [Providers & Services](#7-providers--services)
8. [Dependency Injection](#8-dependency-injection)
9. [DTOs & Validation](#9-dtos--validation)
10. [Pipes](#10-pipes)
11. [Middleware](#11-middleware)
12. [Guards — Authentication & Authorization](#12-guards--authentication--authorization)
13. [Interceptors](#13-interceptors)
14. [Exception Filters](#14-exception-filters)
15. [Database Integration with TypeORM](#15-database-integration-with-typeorm)
16. [Database Integration with Prisma](#16-database-integration-with-prisma)
17. [Configuration & Environment Variables](#17-configuration--environment-variables)
18. [Full CRUD Module Example](#18-full-crud-module-example)
19. [NestJS vs Express — Side by Side](#19-nestjs-vs-express--side-by-side)
20. [Quick Reference Cheatsheet](#20-quick-reference-cheatsheet)

---

## 1. What is NestJS?

**NestJS** is a Node.js framework for building efficient, scalable
server-side applications. It is built with **TypeScript** and heavily
inspired by **Angular** — using decorators, dependency injection, and
a modular architecture.

```
┌─────────────────────────────────────────────────────────────────┐
│                     NESTJS ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Request                                                       │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────┐    ┌──────────┐    ┌────────┐    ┌─────────────┐  │
│  │Middleware│ → │  Guards   │ → │ Pipes  │ → │ Controller   │  │
│  └─────────┘    └──────────┘    └────────┘    └──────┬──────┘  │
│                                                       │          │
│                                                       ▼          │
│                                                ┌─────────────┐  │
│                                                │   Service   │  │
│                                                │ (business    │  │
│                                                │  logic)      │  │
│                                                └──────┬──────┘  │
│                                                       │          │
│                                                       ▼          │
│                                                ┌─────────────┐  │
│                                                │  Database    │  │
│                                                │ (TypeORM/    │  │
│                                                │  Prisma)     │  │
│                                                └─────────────┘  │
│      ▲                                                          │
│      │                                                          │
│  ┌─────────────┐    ┌─────────────┐                            │
│  │ Interceptors│ ←  │ Exception   │ ← Response                  │
│  │ (transform) │    │ Filters     │                            │
│  └─────────────┘    └─────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

NestJS sits on top of Express (by default) or Fastify — you can still
access the underlying Express `req`/`res` if needed, but Nest provides
a structured, opinionated way to organize everything.

---

## 2. Why NestJS over Express?

Express is **unopinionated** — it gives you the building blocks but no
structure. As an app grows, every team organizes it differently. NestJS
provides that structure out of the box.

```
┌──────────────────────┬──────────────────────────────────────────┐
│ Express              │ NestJS                                   │
├──────────────────────┼──────────────────────────────────────────┤
│ Minimal, flexible    │ Opinionated, structured                  │
│ No built-in DI       │ Built-in Dependency Injection             │
│ Manual organization  │ Modules, Controllers, Services enforced   │
│ JavaScript or TS     │ TypeScript-first (JS also supported)      │
│ No built-in testing  │ Built-in testing utilities (Jest)         │
│ Manual validation    │ class-validator + Pipes built in          │
│ Steeper at scale     │ Easier to scale — consistent patterns     │
│ Faster to prototype  │ More setup, but pays off in larger apps   │
└──────────────────────┴──────────────────────────────────────────┘
```

### When to choose NestJS

```
✅ Building a large application with multiple teams
✅ You want enforced structure and consistency
✅ You're already using TypeScript
✅ You need built-in support for microservices, GraphQL, WebSockets
✅ You want testability built into the architecture

❌ Building a tiny API or prototype (Express is faster to start)
❌ Team is unfamiliar with TypeScript/decorators and timeline is tight
```

---

## 3. Installation & Project Setup

### Install the Nest CLI

```bash
npm install -g @nestjs/cli
```

### Create a new project

```bash
nest new my-app

# Choose a package manager when prompted: npm, yarn, or pnpm
cd my-app
```

### Run the development server

```bash
npm run start:dev
# Server runs at http://localhost:3000 with hot-reload on file changes
```

### Generated package.json scripts

```json
{
  "scripts": {
    "build":      "nest build",
    "start":      "nest start",
    "start:dev":  "nest start --watch",
    "start:prod": "node dist/main",
    "test":       "jest",
    "test:e2e":   "jest --config ./test/jest-e2e.json"
  }
}
```

---

## 4. Project Structure

```
my-app/
│
├── src/
│   ├── main.ts                  ← entry point — bootstraps the app
│   ├── app.module.ts            ← root module
│   ├── app.controller.ts        ← root controller
│   ├── app.service.ts           ← root service
│   │
│   ├── users/                   ← feature module (one folder per resource)
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   └── common/                  ← shared utilities
│       ├── decorators/
│       ├── filters/
│       ├── interceptors/
│       └── pipes/
│
├── test/                         ← end-to-end tests
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Entry point — main.ts

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  // Create the Nest application from the root module
  const app = await NestFactory.create(AppModule);

  // Enable global validation — automatically validates DTOs on every request
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strip properties not defined in the DTO
    forbidNonWhitelisted: true, // throw error if extra properties are sent
    transform: true,        // auto-transform payloads to DTO instances
  }));

  // Enable CORS
  app.enableCors();

  // Set a global prefix for all routes — e.g. /api/users instead of /users
  app.setGlobalPrefix("api");

  await app.listen(3000);
  console.log("Application running on http://localhost:3000");
}

bootstrap();
```

---

## 5. Modules

A **module** is a class annotated with `@Module()` that organizes
related controllers, providers (services), and imports into a cohesive
unit. Every Nest app has at least one module — the **root module**.

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { AuthModule }  from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  // imports — other modules whose exported providers this module needs
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // makes .env vars available everywhere
    UsersModule,
    AuthModule,
  ],

  // controllers — handle incoming requests for THIS module
  controllers: [],

  // providers — services, repositories, etc. available within this module
  providers: [],
})
export class AppModule {}
```

### Feature module example

```typescript
// src/users/users.module.ts
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService }    from "./users.service";

@Module({
  controllers: [UsersController],  // routes for /users
  providers:   [UsersService],     // business logic for users

  // exports — make UsersService available to OTHER modules that import this one
  exports: [UsersService],
})
export class UsersModule {}
```

### Module diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AppModule (root)                             │
│                                                                  │
│   imports: [UsersModule, AuthModule, PostsModule]               │
│                                                                  │
│   ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│   │  UsersModule    │  │  AuthModule      │  │  PostsModule    │ │
│   │  ┌────────────┐ │  │  ┌─────────────┐ │  │  ┌───────────┐ │ │
│   │  │Controller  │ │  │  │ Controller  │ │  │  │Controller │ │ │
│   │  └────────────┘ │  │  └─────────────┘ │  │  └───────────┘ │ │
│   │  ┌────────────┐ │  │  ┌─────────────┐ │  │  ┌───────────┐ │ │
│   │  │ Service    │◄┼──┼──┤ Service     │ │  │  │ Service   │ │ │
│   │  └────────────┘ │  │  └─────────────┘ │  │  └───────────┘ │ │
│   │  exports:       │  │  (imports        │  │                │ │
│   │  [UsersService] │  │   UsersModule)   │  │                │ │
│   └─────────────────┘  └─────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Controllers

A **controller** handles incoming HTTP requests and returns responses.
It maps URLs and HTTP methods to handler methods using decorators.

```typescript
// src/users/users.controller.ts
import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from "@nestjs/common";
import { UsersService }   from "./users.service";
import { CreateUserDto }  from "./dto/create-user.dto";
import { UpdateUserDto }  from "./dto/update-user.dto";

// @Controller("users") — all routes here are prefixed with /users
@Controller("users")
export class UsersController {
  // Dependency injection — Nest automatically provides UsersService
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  // @Query() extracts query string parameters: ?role=admin&page=2
  @Get()
  findAll(@Query("role") role?: string) {
    return this.usersService.findAll(role);
  }

  // GET /users/:id
  // @Param("id") extracts the route parameter
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id); // "+id" converts string to number
  }

  // POST /users
  // @Body() extracts and validates the request body using CreateUserDto
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 instead of default 200/201
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // PUT /users/:id — full replacement
  @Put(":id")
  replace(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // PATCH /users/:id — partial update
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
```

### Common decorators

```
┌────────────────────┬────────────────────────────────────────────┐
│ Decorator          │ Purpose                                     │
├────────────────────┼────────────────────────────────────────────┤
│ @Controller(path)  │ Defines a controller with a base route       │
│ @Get(path)         │ Maps to GET request                          │
│ @Post(path)        │ Maps to POST request                         │
│ @Put(path)         │ Maps to PUT request                          │
│ @Patch(path)       │ Maps to PATCH request                        │
│ @Delete(path)      │ Maps to DELETE request                       │
│ @Param(key)        │ Extracts route parameter (req.params)        │
│ @Query(key)        │ Extracts query parameter (req.query)         │
│ @Body()            │ Extracts and validates request body          │
│ @Headers(key)      │ Extracts request headers                      │
│ @Req()             │ Access raw Express request object             │
│ @Res()             │ Access raw Express response object            │
│ @HttpCode(status)  │ Override the default HTTP status code         │
└────────────────────┴────────────────────────────────────────────┘
```

---

## 7. Providers & Services

A **provider** is any class that can be injected as a dependency —
most commonly a **service** containing business logic. Services are
decorated with `@Injectable()`.

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

// @Injectable() marks this class as a provider that can be
// injected into controllers or other services
@Injectable()
export class UsersService {
  // In-memory data store — replace with a database in production
  private users = [
    { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
    { id: 2, name: "John",  email: "john@example.com",  role: "user"  },
  ];
  private nextId = 3;

  findAll(role?: string) {
    if (role) return this.users.filter(u => u.role === role);
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id);

    // NotFoundException automatically returns 404 with a JSON error body
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const exists = this.users.find(u => u.email === createUserDto.email);
    if (exists) {
      // ConflictException automatically returns 409
      throw new ConflictException("Email already exists");
    }

    const newUser = {
      id: this.nextId++,
      ...createUserDto,
      role: createUserDto.role || "user",
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id); // throws 404 if not found
    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(index, 1);
    return { deleted: true };
  }
}
```

### Built-in HTTP exceptions

```typescript
import {
  BadRequestException,    // 400
  UnauthorizedException,  // 401
  ForbiddenException,     // 403
  NotFoundException,      // 404
  ConflictException,      // 409
  InternalServerErrorException, // 500
} from "@nestjs/common";

// Throwing any of these automatically produces the correct
// HTTP status code AND a structured JSON error response:
// { "statusCode": 404, "message": "User not found", "error": "Not Found" }

throw new NotFoundException("User not found");
throw new BadRequestException("Email is required");
throw new ConflictException("Email already exists");
```

---

## 8. Dependency Injection

NestJS has a built-in **Dependency Injection (DI)** container. Instead
of manually creating instances of classes (`new UsersService()`), you
declare what a class needs in its constructor, and Nest provides it.

```
┌─────────────────────────────────────────────────────────────────┐
│                  WITHOUT DEPENDENCY INJECTION (❌)                │
│                                                                   │
│  class UsersController {                                         │
│    private usersService = new UsersService();                    │
│    // Hard-coded dependency — hard to test, hard to swap          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  WITH DEPENDENCY INJECTION (✅)                   │
│                                                                   │
│  class UsersController {                                         │
│    constructor(private usersService: UsersService) {}            │
│    // Nest automatically creates and injects UsersService         │
│    // Easy to mock in tests — just pass a fake implementation     │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### How it works

```typescript
// 1. Mark the service as injectable
@Injectable()
export class UsersService { /* ... */ }

// 2. Register it as a provider in the module
@Module({
  controllers: [UsersController],
  providers:   [UsersService],  // Nest's DI container now knows how to create it
})
export class UsersModule {}

// 3. Inject it via the constructor — Nest resolves it automatically
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // "private readonly usersService" is shorthand that:
  //   - declares a class property "usersService"
  //   - assigns the injected instance to it
  //   - makes it read-only
}
```

### Injecting multiple dependencies

```typescript
@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,   // inject another service
    private readonly commentsService: CommentsService,
    @InjectRepository(Post) private postsRepo: Repository<Post>, // TypeORM repo
  ) {}

  async createPost(userId: number, title: string) {
    // Use injected dependencies
    const user = this.usersService.findOne(userId);
    // ...
  }
}
```

### Provider scopes

```typescript
import { Injectable, Scope } from "@nestjs/common";

// DEFAULT (singleton) — one instance shared across the entire app
@Injectable()
export class DefaultService {}

// REQUEST — new instance created for each incoming request
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}

// TRANSIENT — new instance every time it's injected
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {}
```

---

## 9. DTOs & Validation

A **DTO (Data Transfer Object)** defines the shape of data sent to/from
your API. Combined with `class-validator`, DTOs automatically validate
incoming request bodies.

### Installation

```bash
npm install class-validator class-transformer
```

### Creating DTOs

```typescript
// src/users/dto/create-user.dto.ts
import {
  IsString, IsEmail, IsNotEmpty, MinLength, MaxLength,
  IsOptional, IsEnum, IsInt, Min, Max,
} from "class-validator";

export enum UserRole {
  USER  = "user",
  ADMIN = "admin",
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  @MaxLength(100)
  name: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;

  @IsOptional()              // field is not required
  @IsEnum(UserRole)          // must be one of the enum values
  role?: UserRole;

  @IsOptional()
  @IsInt()
  @Min(18, { message: "Age must be at least 18" })
  @Max(120)
  age?: number;
}
```

```typescript
// src/users/dto/update-user.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

// PartialType makes ALL fields from CreateUserDto OPTIONAL
// Perfect for PATCH requests — only validates fields that are present
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### How validation works automatically

```typescript
// With ValidationPipe registered globally (in main.ts):
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // By the time this code runs, createUserDto has ALREADY been validated
  // If validation fails, Nest automatically returns 400 with details:
  //
  // {
  //   "statusCode": 400,
  //   "message": [
  //     "Name is required",
  //     "Please provide a valid email address",
  //     "Password must be at least 8 characters"
  //   ],
  //   "error": "Bad Request"
  // }

  return this.usersService.create(createUserDto);
}
```

### Common class-validator decorators

```
┌──────────────────────┬────────────────────────────────────────────┐
│ Decorator            │ Validates                                   │
├──────────────────────┼────────────────────────────────────────────┤
│ @IsString()          │ Value is a string                          │
│ @IsNumber()           │ Value is a number                          │
│ @IsInt()              │ Value is an integer                        │
│ @IsBoolean()          │ Value is true/false                        │
│ @IsEmail()            │ Value is a valid email format               │
│ @IsNotEmpty()         │ Value is not empty/undefined                │
│ @IsOptional()         │ Field is allowed to be missing              │
│ @MinLength(n)         │ String has at least n characters            │
│ @MaxLength(n)         │ String has at most n characters             │
│ @Min(n) / @Max(n)     │ Number is within range                      │
│ @IsEnum(EnumType)     │ Value matches one of the enum values        │
│ @IsArray()            │ Value is an array                          │
│ @ValidateNested()     │ Validate nested objects/DTOs                │
│ @IsDateString()       │ Value is a valid ISO date string            │
│ @IsUrl()              │ Value is a valid URL                        │
│ @Matches(regex)       │ Value matches a regular expression          │
└──────────────────────┴────────────────────────────────────────────┘
```

---

## 10. Pipes

**Pipes** transform or validate input data before it reaches a route
handler. `ValidationPipe` (used above) is the most common, but Nest
also provides built-in transformation pipes.

```typescript
import {
  ParseIntPipe, ParseBoolPipe, ParseUUIDPipe,
  DefaultValuePipe,
} from "@nestjs/common";

@Controller("users")
export class UsersController {

  // ParseIntPipe — converts the string param "5" to the number 5
  // If conversion fails (e.g. "/users/abc"), throws 400 automatically
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    // id is guaranteed to be a number here
    return this.usersService.findOne(id);
  }

  // ParseUUIDPipe — validates the param is a valid UUID
  @Get("by-uuid/:uuid")
  findByUuid(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return this.usersService.findByUuid(uuid);
  }

  // Query params with default values and type conversion
  @Get()
  findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("active", new DefaultValuePipe(false), ParseBoolPipe) active: boolean,
  ) {
    // page: number (default 1)
    // limit: number (default 10)
    // active: boolean (default false)
    return this.usersService.findAll({ page, limit, active });
  }
}
```

### Custom pipe

```typescript
// src/common/pipes/trim.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === "string") {
      return value.trim(); // remove leading/trailing whitespace
    }

    if (typeof value === "object" && value !== null) {
      // Trim all string properties of an object (e.g. a DTO)
      Object.keys(value).forEach((key) => {
        if (typeof value[key] === "string") {
          value[key] = value[key].trim();
        }
      });
    }

    return value;
  }
}

// Usage
@Post()
create(@Body(TrimPipe) createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

---

## 11. Middleware

NestJS middleware works similarly to Express middleware — functions
that run before the route handler.

### Function middleware

```typescript
// src/common/middleware/logger.middleware.ts
import { Request, Response, NextFunction } from "express";

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
}
```

### Class-based middleware

```typescript
// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  }
}
```

### Applying middleware in a module

```typescript
// src/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";

@Module({ /* ... */ })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes("*"); // apply to ALL routes

    // Or apply to specific routes/methods
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: "users", method: RequestMethod.GET });
  }
}
```

---

## 12. Guards — Authentication & Authorization

**Guards** determine whether a request should be handled by the route
handler — used primarily for authentication and authorization (similar
to Express auth middleware, but more structured).

### JWT Auth Guard with Passport

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
```

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "secret-key",
    });
  }

  // Called automatically after the token is verified
  // The return value becomes req.user
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// "jwt" matches the strategy name registered by PassportStrategy(Strategy)
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

### Using guards on routes

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("profile")
export class ProfileController {

  // Protect a single route
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req) {
    // req.user is set by JwtStrategy's validate() method
    return req.user;
  }
}

// Protect ALL routes in a controller
@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  @Get("dashboard")
  getDashboard() { /* ... */ }

  @Get("users")
  getUsers() { /* ... */ }
}
```

### Custom Role Guard

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from "@nestjs/common";

// Custom decorator — attaches metadata to a route handler
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the roles set by the @Roles() decorator on the handler
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());

    if (!requiredRoles) return true; // no roles required — allow access

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
```

```typescript
// Usage — combine JWT auth + role check
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Delete(":id")
remove(@Param("id", ParseIntPipe) id: number) {
  return this.usersService.remove(id);
}
```

---

## 13. Interceptors

**Interceptors** can transform the result returned from a route handler,
extend request/response handling with extra logic, or transform exceptions.

### Response transformation interceptor

```typescript
// src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // map() runs AFTER the route handler returns its result
    return next.handle().pipe(
      map((data) => ({
        success:   true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Before: { "id": 1, "name": "Alice" }
// After:  {
//   "success": true,
//   "data": { "id": 1, "name": "Alice" },
//   "timestamp": "2026-06-14T10:30:00.000Z"
// }
```

### Logging interceptor

```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req   = context.switchToHttp().getRequest();
    const start = Date.now();

    console.log(`→ ${req.method} ${req.url}`);

    return next.handle().pipe(
      tap(() => {
        console.log(`← ${req.method} ${req.url} - ${Date.now() - start}ms`);
      }),
    );
  }
}
```

### Applying interceptors

```typescript
// Global — applies to every route
// main.ts
app.useGlobalInterceptors(new LoggingInterceptor());

// Controller-level — applies to all routes in this controller
@UseInterceptors(LoggingInterceptor)
@Controller("users")
export class UsersController { /* ... */ }

// Route-level — applies to a single route
@UseInterceptors(TransformInterceptor)
@Get()
findAll() { /* ... */ }
```

---

## 14. Exception Filters

**Exception filters** catch errors thrown anywhere in your application
and format the error response consistently.

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException) // catches all HttpException types (and subclasses)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   = exception.getStatus();

    response.status(status).json({
      success:   false,
      statusCode: status,
      message:   exception.message,
      path:      request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Catching ALL exceptions (including unhandled errors)

```typescript
// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch() // no argument — catches EVERYTHING
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : "Internal server error";

    // Log unexpected errors for debugging
    if (!(exception instanceof HttpException)) {
      console.error(exception);
    }

    response.status(status).json({
      success:    false,
      statusCode: status,
      message,
      path:       request.url,
      timestamp:  new Date().toISOString(),
    });
  }
}
```

```typescript
// main.ts — register globally
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## 15. Database Integration with TypeORM

### Installation

```bash
npm install @nestjs/typeorm typeorm pg
```

### Configuration

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:     "postgres",
      host:     process.env.DB_HOST     || "localhost",
      port:     Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + "/**/*.entity{.ts,.js}"], // auto-discover entities
      synchronize: process.env.NODE_ENV !== "production", // auto-sync schema (dev only!)
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

### Entity definition

```typescript
// src/users/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from "typeorm";
import { Post } from "../../posts/entities/post.entity";

@Entity("users") // maps to "users" table
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: "user" })
  role: string;

  // One user can have many posts
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Using the repository in a service

```typescript
// src/users/users.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
  imports:     [TypeOrmModule.forFeature([User])], // register User entity's repository
  controllers: [UsersController],
  providers:   [UsersService],
})
export class UsersModule {}
```

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  // @InjectRepository injects the TypeORM repository for the User entity
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(role?: string): Promise<User[]> {
    if (role) return this.usersRepository.find({ where: { role } });
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // create() instantiates a new entity (doesn't save to DB yet)
    const user = this.usersRepository.create({ ...dto, password: hashedPassword });

    // save() persists it to the database
    return this.usersRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // throws 404 if not found
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Relations — load related data
  async findWithPosts(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where:     { id },
      relations: ["posts"], // JOIN with posts table
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
}
```

---

## 16. Database Integration with Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // onModuleInit — connect when the module starts
  async onModuleInit() {
    await this.$connect();
  }

  // onModuleDestroy — disconnect gracefully on shutdown
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// @Global() makes PrismaService available everywhere without importing this module
@Global()
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}
```

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(role?: string) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id); // throws 404 if not found
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
```

---

## 17. Configuration & Environment Variables

```bash
npm install @nestjs/config
```

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:  true,        // available in all modules without re-importing
      envFilePath: ".env",    // default — can specify .env.production etc.
    }),
  ],
})
export class AppModule {}
```

```typescript
// Using ConfigService anywhere
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    // get() returns undefined if not found — provide a default as 2nd arg
    return this.configService.get<string>("DATABASE_URL", "postgresql://localhost/dev");
  }
}
```

### Validated configuration with Joi

```bash
npm install joi
```

```typescript
import * as Joi from "joi";

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV:    Joi.string().valid("development", "production", "test").default("development"),
    PORT:        Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET:  Joi.string().required(),
  }),
  // App fails to start if validation fails — catches missing env vars early
});
```

---

## 18. Full CRUD Module Example

```bash
# Generate a complete CRUD module with one command
nest generate resource users
# Prompts: choose transport layer (REST API), generate CRUD entry points? (Yes)
```

This generates:

```
src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── users.controller.spec.ts   ← unit test for controller
├── users.service.spec.ts      ← unit test for service
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
└── entities/
    └── user.entity.ts
```

### Generated controller (annotated)

```typescript
// src/users/users.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe,
} from "@nestjs/common";
import { UsersService }  from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

### Other generator commands

```bash
nest generate module    users    # generates only the module
nest generate controller users   # generates only the controller
nest generate service   users    # generates only the service
nest generate class      users/dto/create-user.dto
nest generate guard      auth/guards/jwt-auth
nest generate interceptor common/interceptors/logging
nest generate pipe       common/pipes/trim
nest generate filter     common/filters/http-exception

# Shorthand aliases: g, mo, co, s, cl, gu, in, pi, f
nest g co users
```

---

## 19. NestJS vs Express — Side by Side

The same `/users/:id` GET route in both frameworks:

```javascript
// Express
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
```

```typescript
// NestJS
@Get(":id")
async findOne(@Param("id", ParseIntPipe) id: number) {
  // Service throws NotFoundException → Nest handles 404 automatically
  return this.usersService.findOne(id);
}

// In the service:
async findOne(id: number) {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) throw new NotFoundException("User not found");
  return user;
}
```

### Side by side comparison

```
┌─────────────────────────┬──────────────────────┬──────────────────────┐
│ Concept                 │ Express               │ NestJS               │
├─────────────────────────┼──────────────────────┼──────────────────────┤
│ Routing                 │ app.get("/path", fn)  │ @Get("path")         │
│ Route params            │ req.params.id         │ @Param("id")         │
│ Query params            │ req.query.page        │ @Query("page")       │
│ Request body            │ req.body              │ @Body()              │
│ Middleware               │ app.use(fn)           │ Middleware classes   │
│ Validation               │ Manual / Joi/express-validator│ class-validator + Pipes │
│ Error handling           │ Error middleware      │ Exception Filters    │
│ Dependency Injection     │ Manual imports        │ Built-in DI container│
│ Project structure        │ Your choice           │ Modules enforced     │
│ Database integration     │ Manual setup          │ @nestjs/typeorm, etc.│
│ Testing                  │ Manual setup          │ Built-in Jest setup  │
└─────────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 20. Quick Reference Cheatsheet

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLI COMMANDS                                  │
├──────────────────────────────────────────────────────────────────┤
│  nest new my-app                  → create new project           │
│  npm run start:dev                → dev server with hot-reload   │
│  nest generate resource users     → full CRUD module             │
│  nest g co|s|mo|gu|in|pi|f <name> → generate specific piece       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    CORE DECORATORS                               │
├──────────────────────────────────────────────────────────────────┤
│  @Module({ imports, controllers, providers, exports })           │
│  @Controller("path")              → defines route prefix         │
│  @Injectable()                    → marks a class as a provider  │
│  @Get/@Post/@Put/@Patch/@Delete("path") → HTTP methods            │
│  @Param("key") @Query("key") @Body() → extract request data      │
│  @UseGuards(Guard)                → apply guards                 │
│  @UseInterceptors(Interceptor)    → apply interceptors           │
│  @UsePipes(Pipe)                  → apply pipes                  │
│  @Catch(ExceptionType)            → exception filter target      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  REQUEST PIPELINE ORDER                          │
├──────────────────────────────────────────────────────────────────┤
│  1. Middleware       (logging, raw req/res manipulation)         │
│  2. Guards           (authentication, authorization)             │
│  3. Interceptors     (before) — pre-processing                   │
│  4. Pipes            (validation, transformation)                │
│  5. Route Handler    (controller method)                         │
│  6. Interceptors     (after) — transform response                │
│  7. Exception Filter (if any error thrown)                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  HTTP EXCEPTIONS                                 │
├──────────────────────────────────────────────────────────────────┤
│  BadRequestException        → 400                                │
│  UnauthorizedException      → 401                                │
│  ForbiddenException         → 403                                │
│  NotFoundException          → 404                                │
│  ConflictException          → 409                                │
│  InternalServerErrorException → 500                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  DTO VALIDATION SETUP                            │
├──────────────────────────────────────────────────────────────────┤
│  npm install class-validator class-transformer                   │
│                                                                   │
│  // main.ts                                                       │
│  app.useGlobalPipes(new ValidationPipe({                          │
│    whitelist: true,                                               │
│    transform: true,                                               │
│  }));                                                             │
│                                                                   │
│  // DTO                                                           │
│  @IsString() @IsNotEmpty()                                        │
│  name: string;                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

> **Summary:** NestJS brings structure and consistency to Node.js
> backends through modules, controllers, and providers — all wired
> together with dependency injection. DTOs and Pipes handle validation
> automatically, Guards manage auth, Interceptors transform
> responses, and Exception Filters standardize errors. It's a
> steeper learning curve than Express, but that structure pays off
> significantly as an application and team grow.