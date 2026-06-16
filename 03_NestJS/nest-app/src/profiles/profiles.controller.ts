// ─────────────────────────────────────────────────────────────────────
// SECTION 1 — Basic Controller (no service, no validation)
// ─────────────────────────────────────────────────────────────────────
// This is the most minimal version of a NestJS controller.
// It handles HTTP requests and returns hardcoded/inline responses.
// No service layer — business logic is directly in the controller (not ideal).
// No validation — any data sent in the body is accepted as-is.

// import {
//   Controller,   ← marks this class as a NestJS controller
//   Get,          ← maps a method to HTTP GET
//   Post,         ← maps a method to HTTP POST
//   Put,          ← maps a method to HTTP PUT
//   Delete,       ← maps a method to HTTP DELETE
//   HttpCode,     ← overrides the default HTTP response status code
//   HttpStatus,   ← enum of HTTP status codes (200, 201, 204, 404, etc.)
//   Query,        ← extracts query string params → req.query.key
//   Param,        ← extracts route params → req.params.id
//   Body,         ← extracts and parses the request body → req.body
// } from '@nestjs/common';
// import { CreateProfileDto } from './dto/create-profile.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';

// @Controller('profiles') sets the base route prefix for all methods here
// Every route in this controller starts with /profiles
// @Controller('profiles')
// export class ProfilesController {
//   constructor(private ProfilesService: ProfilesService) {}

//   // GET /profiles?age=25
//   // @Query('age') extracts the "age" query parameter from the URL
//   // Example: GET /profiles?age=25 → age = "25" (always a string unless pipe used)
//   @Get()
//   findAll(@Query('age') age: number) {
//     return { age }; // returns the query param as JSON
//   }

//   // GET /profiles/:id
//   // :id is a dynamic route segment — matches any value in that position
//   // @Param('id') extracts it from the URL
//   // Example: GET /profiles/123 → id = "123"
//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return { id };
//   }

//   // POST /profiles
//   // @Body() extracts the JSON request body
//   // CreateProfileDto defines the expected shape of the body
//   // ⚠️ Without ValidationPipe, no validation runs — any data is accepted
//   @Post()
//   create(@Body() CreateProfileDto: CreateProfileDto) {
//     return {
//       name: CreateProfileDto.name,
//       age:  CreateProfileDto.age,
//     };
//   }

//   // PUT /profiles/:id
//   // Uses BOTH @Param (for the ID) and @Body (for the update data)
//   // PUT = full replacement of the resource
//   @Put(':id')
//   update(@Param('id') id: string, @Body() UpdateProfileDto: UpdateProfileDto) {
//     return {
//       id,
//       ...UpdateProfileDto, // spread all updated fields into the response
//     };
//   }

//   // DELETE /profiles/:id
//   // @HttpCode(HttpStatus.NO_CONTENT) → sends 204 instead of default 200
//   // 204 No Content = success but nothing to return in the body
//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   remove(@Param('id') id: string) {}
//   // Empty body — in a real app you would call a service to delete from DB
// }

// ─────────────────────────────────────────────────────────────────────
// SECTION 2 — Controller with Service (proper MVC separation)
// ─────────────────────────────────────────────────────────────────────
// The controller's ONLY job here is to:
//   1. Extract data from the request (params, body, query)
//   2. Call the appropriate service method
//   3. Return the result
//
// All business logic (data access, validation, errors) lives in the SERVICE.
// This separation makes both layers easier to test and maintain independently.

// @Controller('profiles')
// export class ProfilesController {
//   // Dependency Injection — NestJS automatically creates and provides
//   // an instance of ProfilesService when this controller is created.
//   // 'private' creates a class property; 'readonly' prevents reassignment.
//   constructor(private ProfilesService: ProfilesService) {}

//   // GET /profiles
//   // Delegates entirely to the service — controller does zero logic
//   @Get()
//   findAll() {
//     return this.ProfilesService.findAll();
//   }

//   // GET /profiles/:id
//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.ProfilesService.findOne(id);
//   }

//   // POST /profiles
//   @Post()
//   create(@Body() CreateProfileDto: CreateProfileDto) {
//     return this.ProfilesService.create(CreateProfileDto);
//   }

//   // PUT /profiles/:id
//   @Put(':id')
//   update(@Param('id') id: string, @Body() UpdateProfileDto: UpdateProfileDto) {
//     return this.ProfilesService.update(id, UpdateProfileDto);
//   }

//   // DELETE /profiles/:id
//   // 204 No Content — resource was deleted, no body needed
//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   remove(@Param('id') id: string) {
//     return this.ProfilesService.remove(id);
//   }
// }

// ─────────────────────────────────────────────────────────────────────
// SECTION 3 — Exception Handling
// ─────────────────────────────────────────────────────────────────────
// NestJS provides built-in HTTP exception classes that automatically
// produce the right status code AND a structured JSON error body:
//
//   throw new NotFoundException("Profile not found")
//   →  HTTP 404
//   →  { "statusCode": 404, "message": "Profile not found", "error": "Not Found" }
//
// This is far cleaner than Express where you'd manually do:
//   res.status(404).json({ error: "Profile not found" })
//
// The try/catch here wraps the service call so if the service throws
// a plain JS Error, we convert it into a proper HTTP exception.

// @Get(':id')
// findOne(@Param('id') id: string) {
//   try {
//     return this.ProfilesService.findOne(id);
//     // If the profile doesn't exist, the service throws an Error
//   } catch (error) {
//     // Catch the raw error and re-throw as a proper NestJS HTTP exception
//     // NotFoundException → 404 Not Found response automatically
//     throw new NotFoundException(error.message);
//   }
// }

// ─────────────────────────────────────────────────────────────────────
// SECTION 4 — Pipes (ACTIVE CODE)
// ─────────────────────────────────────────────────────────────────────
// Pipes run BEFORE the route handler and either:
//   a) TRANSFORM the value (e.g. string "abc-123" → validated UUID type)
//   b) VALIDATE the value (e.g. check DTO fields pass class-validator rules)
//   c) Throw a 400 Bad Request automatically if transformation/validation fails
//
// Two pipes are used here:
//   ParseUUIDPipe  → validates that a route param is a valid UUID v4
//   ValidationPipe → validates that the request body matches the DTO rules

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe, // validates and parses UUID route params
  ValidationPipe, // validates request body against DTO class-validator rules
} from '@nestjs/common';

// UUID is a TypeScript type from Node's built-in "crypto" module
// It represents a string in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
import type { UUID } from 'crypto';

import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

// All routes in this controller are prefixed with /profiles
@Controller('profiles')
export class ProfilesController {
  // Dependency Injection — Nest provides ProfilesService automatically
  // based on its registration in profiles.module.ts providers array
  constructor(private ProfilesService: ProfilesService) {}

  // ── GET /profiles/:id ─────────────────────────────────────────────
  // ParseUUIDPipe validates that the :id param is a valid UUID BEFORE
  // the handler runs. If the value is not a valid UUID:
  //   → Nest automatically returns 400 Bad Request
  //   → { "statusCode": 400, "message": "Validation failed (uuid is expected)" }
  // The id is typed as UUID (not just string) for TypeScript safety.
  //
  // Example valid:   GET /profiles/550e8400-e29b-41d4-a716-446655440000 ✅
  // Example invalid: GET /profiles/123abc → 400 Bad Request ❌
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    // id is guaranteed to be a valid UUID at this point
    return this.ProfilesService.findOne(id);
  }

  // ── POST /profiles ────────────────────────────────────────────────
  // ValidationPipe is applied directly to the @Body() decorator here.
  // This is ROUTE-LEVEL validation (applies only to this route).
  //
  // Alternative: register ValidationPipe globally in main.ts with
  //   app.useGlobalPipes(new ValidationPipe())
  //   → then you don't need to pass it to each @Body() individually
  //
  // ValidationPipe reads the class-validator decorators on CreateProfileDto
  // and validates the incoming body against them:
  //   @IsString() @IsNotEmpty() name: string → validates the name field
  //   @IsInt() @Min(0) age: number           → validates the age field
  //
  // If any field fails validation:
  //   → 400 Bad Request is returned automatically with details:
  //   → { "message": ["name should not be empty", "age must be a number"] }
  @Post()
  create(@Body(new ValidationPipe()) CreateProfileDto: CreateProfileDto) {
    // Body is already validated — safe to pass directly to service
    return this.ProfilesService.create(CreateProfileDto);
  }

  // ── PUT /profiles/:id ─────────────────────────────────────────────
  // ParseUUIDPipe validates :id is a proper UUID (same as findOne above)
  // @Body() receives the update payload — no ValidationPipe here,
  // so UpdateProfileDto fields are not validated in this example
  // (in production you'd add ValidationPipe here too)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() UpdateProfileDto: UpdateProfileDto,
  ) {
    return this.ProfilesService.update(id, UpdateProfileDto);
  }

  // ── DELETE /profiles/:id ──────────────────────────────────────────
  // ParseUUIDPipe ensures only valid UUIDs can trigger a delete
  // Prevents accidental deletion attempts with malformed IDs
  // @HttpCode(HttpStatus.NO_CONTENT) → responds with 204 (no body)
  // 204 is the standard REST response for a successful DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.ProfilesService.remove(id);
  }
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 5 — Guards (NEXT STEP)
// ─────────────────────────────────────────────────────────────────────
// Guards run AFTER middleware and BEFORE pipes/route handlers.
// They answer one question: "Should this request be allowed through?"
//
// Common use cases:
//   JwtAuthGuard  → is the user authenticated? (valid JWT token?)
//   RolesGuard    → does the user have the required role? (admin, user, etc.)
//
// Usage:
//   @UseGuards(JwtAuthGuard)           ← protect a single route
//   @UseGuards(JwtAuthGuard, RolesGuard) ← stack multiple guards
//
// Applied at different levels:
//   Method level  → @UseGuards(Guard) above a single @Get()/@Post() etc.
//   Controller level → @UseGuards(Guard) above the @Controller() class
//   Global level  → app.useGlobalGuards(new Guard()) in main.ts
