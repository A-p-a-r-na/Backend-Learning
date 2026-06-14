# Backend Development Roadmap

> A structured, phase-by-phase guide to becoming a production-ready backend engineer — from JavaScript fundamentals to cloud infrastructure. Each phase builds directly on the previous one. Master one before moving to the next.

---

## Table of Contents

1. [Phase 1 — Language Foundations](#phase-1--language-foundations)
2. [Phase 2 — Runtime & Core Frameworks](#phase-2--runtime--core-frameworks)
3. [Phase 3 — Auth & API Design](#phase-3--auth--api-design)
4. [Phase 4 — Enterprise Framework](#phase-4--enterprise-framework)
5. [Phase 5 — Databases](#phase-5--databases)
6. [Phase 6 — Caching & Messaging](#phase-6--caching--messaging)
7. [Phase 7 — Testing](#phase-7--testing)
8. [Phase 8 — Containerisation](#phase-8--containerisation)
9. [Phase 9 — Web Server & Reverse Proxy](#phase-9--web-server--reverse-proxy)
10. [Phase 10 — Orchestration & CI/CD](#phase-10--orchestration--cicd)
11. [Phase 11 — Cloud Platform (AWS)](#phase-11--cloud-platform-aws)
12. [Full Roadmap at a Glance](#full-roadmap-at-a-glance)

---

## Phase 1 — Language Foundations

### JavaScript

The absolute foundation of your stack. Everything you write on the backend runs on JavaScript.

- ES6+ syntax — `let`/`const`, arrow functions, destructuring, spread/rest operators
- Asynchronous patterns — callbacks, Promises, `async`/`await`, `Promise.all`
- Event loop — call stack, microtask queue, macrotask queue — how Node.js stays non-blocking
- Modules — CommonJS (`require`) vs ES Modules (`import`/`export`)
- Closures, scope, hoisting, and prototypal inheritance
- Error handling — `try/catch`, custom error classes extending `Error`
- Iterators and generators (`function*`, `yield`)

### TypeScript

TypeScript adds a type system on top of JavaScript. It is essential for large codebases and is the default language of NestJS.

- Type annotations, interfaces, and type aliases
- Generics — `function identity<T>(arg: T): T`
- Union and intersection types — `string | number`, `A & B`
- Utility types — `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `Readonly<T>`
- Decorators — `@Controller()`, `@Injectable()` — essential for NestJS
- `tsconfig.json` configuration — `strict`, `target`, `module`, `paths`, `baseUrl`
- Type narrowing — `typeof`, `instanceof`, discriminated unions
- Declaration files — `*.d.ts`, working with untyped packages via `@types/`

---

## Phase 2 — Runtime & Core Frameworks

### Node.js

The JavaScript runtime that makes server-side JS possible. Built on Chrome's V8 engine and libuv.

- The event loop in depth — libuv phases, `setImmediate` vs `setTimeout` vs `process.nextTick`
- Streams and buffers — readable, writable, transform, duplex streams — piping data
- Core built-in modules — `fs`, `path`, `os`, `crypto`, `http`, `https`, `net`, `url`
- `EventEmitter` pattern — the backbone of Node's async architecture
- `child_process` — `spawn`, `exec`, `execFile`, `fork` for running subprocesses
- Worker threads — offloading CPU-intensive work off the main thread
- npm — `package.json`, `package-lock.json`, scripts, workspaces, `npx`
- Environment variables — `process.env`, `.env` files, `dotenv`
- Error-first callbacks — `(err, result) => {}` — the original Node.js async pattern

### Express.js

The minimal, unopinionated web framework for Node.js. The industry standard for building REST APIs.

- Application setup — `express()`, `app.listen()`, `app.use()`
- Routing — `app.get()`, `app.post()`, `Router()`, nested routers, route parameters
- Middleware — how it chains, execution order, writing custom middleware
- Request object — `req.params`, `req.query`, `req.body`, `req.headers`, `req.ip`
- Response object — `res.json()`, `res.send()`, `res.status()`, `res.redirect()`
- Cookies — `cookie-parser`, `res.cookie()`, `req.cookies`, signed cookies
- Sessions — `express-session`, session stores, `req.session`, `destroy()`
- Body parsing — `express.json()`, `express.urlencoded()`, `multer` for file uploads
- Serving static files — `express.static()`
- CORS — `cors` package, configuring allowed origins, methods, headers
- Error handling middleware — the four-argument signature `(err, req, res, next)`

---

## Phase 3 — Auth & API Design

### Authentication & Security

You cannot ship production apps without a solid understanding of authentication. These concepts underpin everything — NestJS guards, API security, and cloud IAM all assume you know this layer.

**Authentication patterns:**
- Password hashing — `bcrypt`, cost factor / salt rounds, why you never store plain passwords
- JWT (JSON Web Tokens)
  - Structure — header (algorithm), payload (claims), signature
  - `jsonwebtoken` — `jwt.sign()`, `jwt.verify()`, `jwt.decode()`
  - Access token vs refresh token pattern — short-lived access, long-lived refresh
  - Token storage strategy — httpOnly cookies vs `localStorage` — why httpOnly cookies win
- Session-based auth vs token-based auth — trade-offs and when to use each
- OAuth 2.0 — authorization code flow, PKCE, implicit flow, client credentials
- OpenID Connect (OIDC) — authentication on top of OAuth 2.0

**Security hardening:**
- HTTPS / TLS — why plain HTTP is unacceptable in production, certificate setup
- Security headers — `helmet` middleware — `Content-Security-Policy`, `X-Frame-Options`, `HSTS`
- Rate limiting — `express-rate-limit`, per-IP and per-user limits
- Input validation and sanitization — `zod`, `class-validator`, `joi`
- SQL injection prevention — parameterized queries, never string-concatenate user input
- XSS prevention — sanitize output, CSP headers
- CSRF prevention — `SameSite` cookies, CSRF tokens

```js
// JWT authentication middleware (Express)
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
```

### REST API Design

Good API design makes your backend predictable, versioned, and easy to consume. These principles apply whether you are using Express or NestJS.

- Resource naming — plural nouns, no verbs (`/users`, `/orders`, not `/getUsers`, `/createOrder`)
- HTTP methods and their semantics:
  - `GET` — read, idempotent, no body
  - `POST` — create, not idempotent
  - `PUT` — full replace, idempotent
  - `PATCH` — partial update, idempotent
  - `DELETE` — remove, idempotent
- HTTP status codes:
  - `200 OK`, `201 Created`, `204 No Content`
  - `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
  - `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`
  - `500 Internal Server Error`, `503 Service Unavailable`
- API versioning strategies — URL path (`/v1/users`), `Accept` header versioning
- Pagination — `limit`/`offset` (simple), cursor-based (scalable for large datasets)
- Filtering and sorting — `?role=admin&sort=created_at&order=desc`
- Consistent response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 250 },
  "error": null
}
```

- API documentation — Swagger / OpenAPI spec, `@nestjs/swagger` decorator-driven docs
- HATEOAS — hypermedia links in responses (advanced, often skipped in practice)

---

## Phase 4 — Enterprise Framework

### NestJS

A progressive, opinionated Node.js framework built with TypeScript. Heavily inspired by Angular's architecture — modules, dependency injection, decorators. The go-to choice for large, maintainable backend applications.

**Core building blocks:**

- Modules — `@Module()`, feature modules, shared modules, global modules (`@Global()`)
- Controllers — `@Controller()`, `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Param()`, `@Body()`, `@Query()`
- Providers and Services — `@Injectable()`, dependency injection container, provider scopes (default, request, transient)
- Guards — `@UseGuards()`, `CanActivate` interface, JWT guard, role-based guards
- Interceptors — `@UseInterceptors()`, `NestInterceptor`, transform responses, logging, caching
- Pipes — `@UsePipes()`, `ValidationPipe`, `ParseIntPipe`, `class-validator` + `class-transformer`
- Exception Filters — `@Catch()`, `ExceptionFilter`, custom HTTP exceptions
- Middleware — functional vs class middleware, `NestMiddleware` interface
- Configuration — `@nestjs/config`, `ConfigService`, typed config with `ConfigModule.forRoot()`

**Integration patterns:**
- Database — TypeORM module (`@nestjs/typeorm`), Prisma, Mongoose (`@nestjs/mongoose`)
- Authentication — `@nestjs/passport`, JWT strategy, local strategy
- Validation — `class-validator` decorators (`@IsEmail()`, `@IsNotEmpty()`, `@IsInt()`)
- Task scheduling — `@nestjs/schedule`, `@Cron()`, `@Interval()`, `@Timeout()`
- Queues — `@nestjs/bull` (BullMQ integration)
- WebSockets — `@WebSocketGateway()`, `@SubscribeMessage()`
- Testing — `Test.createTestingModule()`, mocking providers with `jest.fn()`

---

## Phase 5 — Databases

### PostgreSQL

The most production-ready, feature-rich open-source relational database. The default choice for serious backend applications.

**SQL fundamentals:**
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` — CRUD operations
- `WHERE`, `ORDER BY`, `LIMIT`, `OFFSET` — filtering, sorting, pagination
- `JOIN` types — `INNER`, `LEFT`, `RIGHT`, `FULL OUTER`, `CROSS`, `SELF`
- Aggregate functions — `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- `GROUP BY` and `HAVING` — grouping and filtering groups
- Subqueries — correlated and non-correlated, `EXISTS`, `NOT EXISTS`
- CTEs (`WITH` clause) — readable multi-step queries, recursive CTEs for hierarchical data
- Window functions — `ROW_NUMBER()`, `RANK()`, `LAG()`, `LEAD()`, `SUM() OVER()`

**PostgreSQL-specific features:**
- Data types — `UUID`, `JSONB`, `ARRAY`, `TIMESTAMPTZ`, `ENUM`, `SERIAL`, `BIGSERIAL`
- Indexes — B-tree (default), GIN (for JSONB/arrays), partial indexes, expression indexes
- Transactions — `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`, isolation levels (`READ COMMITTED`, `SERIALIZABLE`)
- Constraints — `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`, `DEFAULT`
- Views and materialized views — `REFRESH MATERIALIZED VIEW`
- Stored procedures and functions — PL/pgSQL
- `EXPLAIN ANALYZE` — reading query execution plans, identifying sequential scans
- `pg_stat_statements` — extension for slow query detection

**Migrations (never alter production manually):**
- Prisma migrations — `prisma migrate dev`, `prisma migrate deploy`
- TypeORM migrations — `migration:generate`, `migration:run`
- Flyway / Liquibase — language-agnostic migration tools

```sql
-- CTE with window function — get the most recent user per role
WITH ranked_users AS (
  SELECT
    id, name, email, role,
    ROW_NUMBER() OVER (PARTITION BY role ORDER BY created_at DESC) AS rn
  FROM users
  WHERE is_active = true
)
SELECT * FROM ranked_users WHERE rn = 1;
```

### MongoDB

A document-oriented NoSQL database. Learn alongside PostgreSQL — different use cases, valuable to know both.

- Documents, collections, BSON — the JSON-like storage model
- CRUD — `insertOne`, `insertMany`, `find`, `findOne`, `updateOne`, `updateMany`, `deleteOne`
- Query operators — `$eq`, `$in`, `$gt`, `$lt`, `$regex`, `$and`, `$or`, `$not`, `$exists`
- Aggregation pipeline — `$match`, `$group`, `$project`, `$lookup`, `$unwind`, `$sort`, `$limit`
- Indexes — single field, compound, text index, TTL (auto-expire documents), geospatial
- Schema design — embedding vs referencing, denormalization trade-offs
- Mongoose ODM — schema definition, models, virtuals, pre/post middleware hooks, populate
- MongoDB Atlas — managed cloud deployment, Atlas Search, Atlas Vector Search

**When to choose MongoDB over PostgreSQL:**
- Rapidly evolving schemas where flexibility matters more than structure
- High write throughput with horizontal sharding
- Storing heterogeneous JSON-like documents natively
- Content management, product catalogs, user activity feeds

### ORM and Query Builders

| Tool      | Style                  | Best For                                    |
|-----------|------------------------|---------------------------------------------|
| Prisma    | Schema file + CLI      | Type-safe queries, NestJS apps, migrations  |
| TypeORM   | Entity decorator classes | Decorator-heavy, close to raw SQL          |
| Knex.js   | Chainable query builder| Full SQL control without an ORM             |
| Drizzle   | SQL-like TypeScript API| Lightweight, maximum type safety            |

```ts
// Prisma — define schema, get fully typed client
// prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}

// In your service — fully typed, autocompleted
const users = await prisma.user.findMany({
  where:   { email: { contains: "@gmail.com" } },
  include: { posts: true },
  orderBy: { createdAt: "desc" },
  take:    10,
  skip:    0,
});
```

---

## Phase 6 — Caching & Messaging

### Redis

An in-memory data structure store used for caching, session storage, pub/sub, and job queues. Adds a fast data layer in front of your database.

**Core data structures:**
- Strings — `GET`, `SET`, `SETEX`, `INCR`, `DECR`, `EXPIRE`, `TTL`
- Hashes — `HSET`, `HGET`, `HGETALL`, `HDEL` — store objects
- Lists — `LPUSH`, `RPUSH`, `LPOP`, `LRANGE` — queues and stacks
- Sets — `SADD`, `SMEMBERS`, `SINTER`, `SUNION` — unique collections
- Sorted Sets — `ZADD`, `ZRANGE`, `ZRANK` — leaderboards, priority queues

**Common use cases:**
- **Caching** — store expensive DB query results with a TTL, avoid redundant computation
- **Session storage** — persist Express sessions via `connect-redis`
- **Rate limiting** — `INCR` + `EXPIRE` per IP per minute
- **Pub/Sub** — `PUBLISH` / `SUBSCRIBE` for real-time events between services
- **Job queues** — BullMQ builds reliable background job processing on top of Redis

```js
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

// Cache DB result for 5 minutes (300 seconds)
await client.setEx("users:all", 300, JSON.stringify(users));

// Check cache before hitting the database
const cached = await client.get("users:all");
if (cached) return JSON.parse(cached);
```

```js
// BullMQ — background job queue
import { Queue, Worker } from "bullmq";

const emailQueue = new Queue("emails", { connection });

// Producer — add job to queue
await emailQueue.add("send-welcome", { userId: 1, email: "user@example.com" });

// Consumer — process jobs
new Worker("emails", async (job) => {
  await sendEmail(job.data);
}, { connection });
```

### Kafka

A distributed event streaming platform designed for high-throughput, fault-tolerant, real-time messaging between services.

**Core concepts:**
- Topics — named channels for messages; partitioned for parallelism
- Partitions and offsets — messages within a partition are ordered and persisted by offset
- Producers — publish messages to topics
- Consumers and consumer groups — multiple consumers share load across partitions
- Brokers and clusters — distributed nodes that store and serve messages
- Message retention — messages persist for a configurable duration (days/weeks), unlike queues that delete on consume
- Exactly-once semantics vs at-least-once delivery — trade-offs in configuration
- Schema Registry — enforce Avro/Protobuf schemas so producers and consumers agree on structure
- `kafkajs` — the leading Node.js Kafka client

**When to use Kafka:**
- High-volume event streams (millions of events per second)
- Event sourcing — every state change stored as an immutable event
- Audit trails — replay the event log to reconstruct state at any point in time
- Decoupling microservices — services emit events without knowing who consumes them
- Real-time data pipelines — stream to analytics, data warehouses, search indexes

**Redis vs Kafka — choosing the right tool:**

| Feature             | Redis (BullMQ)           | Kafka                         |
|---------------------|--------------------------|-------------------------------|
| Throughput          | High                     | Very high (millions/sec)      |
| Message retention   | Until processed          | Configurable (days to forever)|
| Replay past events  | No                       | Yes                           |
| Setup complexity    | Low                      | High                          |
| Ordering guarantee  | Per queue                | Per partition                 |
| Best for            | App-level background jobs| Inter-service event streaming |

---

## Phase 7 — Testing

Learn testing before going into DevOps. It is far harder to retrofit tests into an existing codebase than to build with them from the start.

### The Testing Pyramid

```
        ┌────────────┐
        │    E2E     │  ← Few, slow — test entire user flows end-to-end
        ├────────────┤
        │Integration │  ← Test your API endpoints + real database together
        ├────────────┤
        │   Unit     │  ← Many, fast — test individual functions in isolation
        └────────────┘
```

Write many unit tests, fewer integration tests, and a small number of E2E tests.

### Tools

| Tool             | Purpose                                                  |
|------------------|----------------------------------------------------------|
| Jest             | Test runner, assertion library, mocking — most common    |
| Vitest           | Faster Jest alternative, compatible API, Vite-native     |
| Supertest        | HTTP integration tests — make real requests to Express   |
| Testcontainers   | Spin up real PostgreSQL / Redis in Docker during tests   |
| k6               | Load testing and performance benchmarking                |

### Unit Test

Test a single unit of logic in isolation. Mock all external dependencies (DB, HTTP calls).

```ts
// users.service.spec.ts
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  const mockRepo = { findById: jest.fn() };

  beforeEach(() => {
    service = new UsersService(mockRepo as any);
  });

  it("throws NotFoundException when user not found", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toThrow("User not found");
  });

  it("returns user when found", async () => {
    const user = { id: 1, name: "Arjun", email: "a@email.com" };
    mockRepo.findById.mockResolvedValue(user);
    const result = await service.findById(1);
    expect(result).toEqual(user);
  });
});
```

### Integration Test

Start the actual server and hit real endpoints. Use a test database.

```ts
// users.e2e-spec.ts
import request from "supertest";
import app from "../app";

describe("GET /users/:id", () => {
  it("returns 200 with user data", async () => {
    const res = await request(app).get("/users/1");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("email");
  });

  it("returns 404 for a user that does not exist", async () => {
    const res = await request(app).get("/users/9999");
    expect(res.status).toBe(404);
  });
});
```

**Key testing concepts to know:**
- `describe` / `it` / `test` — organising test suites
- `beforeEach` / `afterEach` / `beforeAll` / `afterAll` — setup and teardown
- `jest.fn()`, `jest.mock()`, `jest.spyOn()` — mocking dependencies
- `expect(x).toBe()`, `.toEqual()`, `.toThrow()`, `.resolves`, `.rejects`
- Code coverage — `jest --coverage`, understanding what to target (aim for logic, not lines)
- Test isolation — each test should be independent and leave no side effects

---

## Phase 8 — Containerisation

### Docker

Package your application and all its dependencies into a portable container image. Eliminates "works on my machine" problems.

**Core concepts:**
- Images vs containers — an image is the blueprint, a container is a running instance
- `Dockerfile` — instructions to build an image: `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`, `ENTRYPOINT`
- `.dockerignore` — exclude `node_modules`, `.env`, `dist` from the build context
- Multi-stage builds — use a build stage and a production stage to keep final images small
- Volumes — persist data outside the container lifecycle (database files, uploads)
- Networking — bridge (default, container-to-container), host, overlay (multi-host Swarm)
- `docker-compose` — define and run multi-container apps locally (app + DB + Redis + worker)
- Container registries — Docker Hub, AWS ECR, GitHub Container Registry

**Production-grade Node.js Dockerfile:**

```dockerfile
# Stage 1 — Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — Production image (no dev dependencies, no source)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

**docker-compose.yml for local development:**

```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pg_data:
```

---

## Phase 9 — Web Server & Reverse Proxy

### Nginx

A high-performance web server used as a reverse proxy, load balancer, and SSL terminator in front of your Node.js app.

**What Nginx does in production:**
- Reverse proxy — receives requests on port 80/443 and forwards them to your Node.js app on port 3000
- SSL/TLS termination — handles HTTPS at the Nginx layer so your app only handles plain HTTP internally
- Load balancing — distributes traffic across multiple app instances (round robin, least connections, IP hash)
- Rate limiting — `limit_req_zone` to throttle abusive clients before they reach your app
- Static file serving — serve your frontend build directly from Nginx, bypassing Node.js entirely
- Gzip compression — `gzip on` to compress responses and reduce bandwidth
- Security headers — add `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`
- Let's Encrypt — free SSL certificates via Certbot, auto-renewal

**Core concepts to understand:**
- `nginx.conf` structure — `http`, `server`, `location` blocks
- `upstream` blocks — define backend server pools
- `proxy_pass` — forward requests to upstream
- `proxy_set_header` — pass original client IP and host to backend
- `server_name` — virtual hosting (multiple domains on one server)

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    listen 80;
    server_name api.myapp.com;
    return 301 https://$host$request_uri;       # redirect HTTP → HTTPS
}

server {
    listen 443 ssl http2;
    server_name api.myapp.com;

    ssl_certificate     /etc/letsencrypt/live/api.myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.myapp.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    gzip on;
    gzip_types application/json text/plain text/css;

    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

---

## Phase 10 — Orchestration & CI/CD

### Kubernetes

Container orchestration — automates deployment, scaling, health management, and rollouts of containerised applications. Learn Docker thoroughly before starting Kubernetes.

**Core concepts (learn in this order):**

**Workloads:**
- Pods — the smallest deployable unit; one or more containers sharing network and storage
- ReplicaSets — ensure N identical pods are always running
- Deployments — manage rollouts, rollbacks, and scaling of ReplicaSets
- StatefulSets — for stateful apps (databases) that need stable network identities and persistent storage
- DaemonSets — run one pod per node (logging agents, monitoring)
- Jobs and CronJobs — one-off or scheduled batch tasks

**Networking:**
- Services — expose pods: `ClusterIP` (internal), `NodePort` (external dev), `LoadBalancer` (cloud LB)
- Ingress — HTTP/HTTPS routing rules; replaces the need for Nginx in Kubernetes
- Ingress Controllers — Nginx Ingress, Traefik — the actual implementation behind Ingress rules
- DNS — services are reachable by name within the cluster (`my-service.namespace.svc.cluster.local`)

**Configuration:**
- ConfigMaps — non-sensitive config (environment variables, config files)
- Secrets — sensitive data (passwords, API keys, TLS certificates) — base64 encoded
- Namespaces — logical isolation between environments (`dev`, `staging`, `production`)

**Storage:**
- PersistentVolumes (PV) and PersistentVolumeClaims (PVC) — abstract storage from pods
- StorageClasses — dynamic provisioning (AWS EBS, GCP Persistent Disk, NFS)

**Scaling and reliability:**
- Horizontal Pod Autoscaler (HPA) — scale pods automatically based on CPU/memory/custom metrics
- Vertical Pod Autoscaler (VPA) — adjust pod resource requests/limits automatically
- Cluster Autoscaler — add/remove nodes based on pending pods
- Liveness and readiness probes — tell Kubernetes when a pod is healthy and ready for traffic
- Resource requests and limits — `requests.cpu`, `requests.memory`, `limits.cpu`, `limits.memory`

**Helm:**
- Kubernetes package manager — install pre-built app configurations (PostgreSQL, Redis, Kafka) with one command
- Charts — parameterised K8s manifests packaged together
- `helm install`, `helm upgrade`, `helm rollback`, `helm uninstall`
- `values.yaml` — override default chart configuration

```yaml
# Deployment + Service manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myapp/api:v1.2.0
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: DATABASE_URL
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: production
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

### CI/CD Pipelines

Automate the path from a git push to a running deployment. Every merge to `main` should automatically test, build, and deploy without manual steps.

**Tools:**

| Tool           | Best For                                      |
|----------------|-----------------------------------------------|
| GitHub Actions | GitHub repos, generous free tier, most popular|
| GitLab CI/CD   | Self-hosted, tightly integrated with GitLab   |
| CircleCI       | Fast parallel jobs, mature ecosystem           |
| ArgoCD         | GitOps for Kubernetes — pull-based deployment |
| Tekton         | Cloud-native pipelines running inside K8s     |

**Typical pipeline stages:**

```
git push → main
    │
    ├── 1. Lint & type-check     (eslint, tsc --noEmit)
    ├── 2. Unit tests            (jest)
    ├── 3. Integration tests     (jest + real DB in Docker)
    ├── 4. Build Docker image    (docker build)
    ├── 5. Push to registry      (docker push → ECR / Docker Hub)
    └── 6. Deploy to Kubernetes  (kubectl set image / ArgoCD sync)
```

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run lint
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/testdb

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: myapp/api:${{ github.sha }},myapp/api:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api-deployment \
            api=myapp/api:${{ github.sha }} \
            --namespace=production
```

---

## Phase 11 — Cloud Platform (AWS)

AWS has the largest market share (~31%), the most comprehensive service catalogue, and the most job postings globally. Learning AWS gives you the widest career options. The concepts transfer directly to GCP and Azure.

**Cloud provider comparison:**

| Feature            | AWS                          | GCP                         | Azure                         |
|--------------------|------------------------------|-----------------------------|-------------------------------|
| Market share       | ~31%                         | ~12%                        | ~25%                          |
| Best for           | General backend, startups    | ML/AI, data engineering     | Microsoft / .NET enterprises  |
| Learning resources | Excellent — most abundant    | Good                        | Good                          |
| Free tier          | 12 months + always-free      | $300 credit + always-free   | $200 credit + always-free     |
| Managed Kubernetes | EKS                          | GKE (easiest to use)        | AKS                           |
| Job market         | Strongest globally           | Strong in data/ML roles     | Strong in enterprise roles    |

---

### AWS Phase 1 — Core Services

Learn these first. They appear in almost every backend deployment regardless of scale.

#### IAM (Identity and Access Management)

Controls who can do what inside your AWS account. Every service you create will need an IAM role.

- Users, Groups, Roles — the three identity types
- Policies — JSON documents that grant or deny permissions, inline vs AWS-managed
- Least privilege principle — grant only the permissions needed, nothing more
- MFA — mandatory for all human users, especially root
- IAM Roles for services — EC2, Lambda, and ECS tasks assume roles, not users
- Instance profiles — how EC2 instances get credentials without storing them

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

#### EC2 (Elastic Compute Cloud)

Virtual servers in the cloud. Your first compute option and the foundation for understanding more managed services.

- Instance types — `t3.micro` (free tier), `t3.medium`, `c5` (compute-optimised), `r5` (memory-optimised)
- AMIs — Amazon Machine Images, pre-built OS snapshots, custom AMIs for faster launch
- Security Groups — stateful firewall at the instance level, inbound and outbound rules
- Elastic IPs — static public IP addresses that survive instance stop/start
- Key pairs — RSA / ED25519 key pairs for SSH access
- User data scripts — shell scripts that run automatically on first boot
- EBS (Elastic Block Store) — persistent SSD block storage that attaches to EC2

```bash
# SSH into an EC2 instance
ssh -i my-key.pem ec2-user@<public-ip>

# Deploy Node.js with PM2 (process manager)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
npm install -g pm2
pm2 start dist/main.js --name api
pm2 startup && pm2 save
```

#### VPC (Virtual Private Cloud)

Your isolated private network inside AWS. Everything runs inside a VPC. Understanding VPC is essential for connecting services securely.

- Subnets — public (has a route to the internet) vs private (no direct internet access)
- Route Tables — rules that determine where network traffic flows
- Internet Gateway (IGW) — attaches to VPC; allows public subnets to reach the internet
- NAT Gateway — allows private subnets to make outbound internet requests without being reachable from outside
- Security Groups — stateful, instance-level firewall (allow rules only)
- NACLs — stateless, subnet-level firewall (allow and deny rules, evaluated in order)
- VPC Peering — connect two VPCs to route traffic between them privately

```
VPC: 10.0.0.0/16
├── Public Subnet:  10.0.1.0/24  ← ALB, Bastion host, NAT Gateway
│   └── Internet Gateway
├── Private Subnet: 10.0.2.0/24  ← ECS / EC2 app servers
│   └── NAT Gateway (outbound internet only)
└── Private Subnet: 10.0.3.0/24  ← RDS databases (no internet access at all)
```

#### S3 (Simple Storage Service)

Object storage for files, images, backups, static websites, and data archives.

- Buckets (containers) and objects (files) — globally unique bucket names
- Storage classes — Standard, Intelligent-Tiering, Standard-IA, Glacier Instant, Glacier Deep Archive
- Versioning — retain multiple versions of every object; protect against accidental deletion
- Bucket policies vs ACLs — control access at the bucket and object level
- Pre-signed URLs — generate temporary URLs to give time-limited access to private objects
- Static website hosting — host a React/Next.js frontend directly from S3
- Lifecycle rules — automatically transition objects to cheaper storage classes or delete after N days
- Cross-region replication — replicate objects to another region for disaster recovery

```js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "ap-south-1" });

// Upload a file
await s3.send(new PutObjectCommand({
  Bucket: "my-bucket",
  Key: `uploads/${filename}`,
  Body: fileBuffer,
  ContentType: "image/jpeg",
}));

// Generate a pre-signed URL (valid for 1 hour)
const url = await getSignedUrl(s3, new GetObjectCommand({
  Bucket: "my-bucket",
  Key: `uploads/${filename}`,
}), { expiresIn: 3600 });
```

#### RDS (Relational Database Service)

Managed relational databases. AWS handles provisioning, patching, backups, and failover.

- Supported engines — PostgreSQL, MySQL, MariaDB, Oracle, SQL Server
- Multi-AZ — synchronous standby replica in another Availability Zone; automatic failover in ~60 seconds
- Read replicas — asynchronous copies for scaling read traffic (up to 15 for Aurora)
- Automated backups — point-in-time restore up to 35 days retention
- Parameter groups — tune database engine settings (max connections, work_mem, etc.)
- Subnet groups — deploy RDS into your private subnets (never in a public subnet)
- Aurora — AWS's cloud-native engine, MySQL/PostgreSQL compatible, up to 5x faster, serverless option available

```
Production RDS configuration example:
  Engine:    PostgreSQL 16
  Instance:  db.r6g.large (2 vCPU, 16GB RAM)
  Storage:   gp3 SSD, 100GB, autoscaling to 1TB
  Multi-AZ:  enabled
  Backups:   7-day automated retention
  Network:   private subnets only, no public access
  Encryption: at-rest (KMS) and in-transit (SSL enforced)
```

---

### AWS Phase 2 — Scaling & Load Balancing

#### ELB — Elastic Load Balancer

Distribute incoming traffic across multiple EC2 instances, ECS tasks, or Lambda functions.

- Application Load Balancer (ALB) — operates at HTTP/HTTPS layer 7; supports path-based and host-based routing; the right choice for REST APIs
- Network Load Balancer (NLB) — operates at TCP layer 4; ultra-low latency; use for non-HTTP workloads
- Target Groups — define which instances/tasks receive traffic; each group has its own health check
- Health checks — ALB removes unhealthy targets from rotation automatically
- SSL termination — attach an ACM (AWS Certificate Manager) certificate to the ALB; backend gets plain HTTP
- Sticky sessions — route a client to the same target every time (useful for stateful apps)

```
Request flow:
  Internet → Route 53 (DNS) → ALB (HTTPS 443)
           → Target Group → EC2 / ECS tasks (HTTP 3000)

Path-based routing:
  api.myapp.com/users  → Target Group: users-service
  api.myapp.com/orders → Target Group: orders-service
  api.myapp.com/auth   → Target Group: auth-service
```

#### Auto Scaling Groups (ASG)

Automatically add or remove EC2 instances in response to demand.

- Launch templates — define instance configuration once (AMI, type, SG, key pair, user data)
- Min / Max / Desired — the three capacity bounds
- Scaling policies:
  - Target tracking — maintain average CPU utilisation at 60%
  - Step scaling — add 2 instances when CPU > 80%, remove 1 when < 40%
  - Scheduled scaling — scale up before peak hours, scale down overnight
- ASG + ALB integration — new instances register automatically in the target group
- Lifecycle hooks — run scripts on instance launch or termination (drain connections, warm up cache)

---

### AWS Phase 3 — Serverless & Containers

#### Lambda

Run code without managing or provisioning servers. Pay only for the compute time you consume.

- Triggers — API Gateway, ALB, S3 events, SQS, SNS, EventBridge, DynamoDB Streams, CloudWatch Events
- Runtimes — Node.js 20.x, Python, Go, Java, Ruby, .NET, custom runtime via Lambda Layers
- Cold starts — the latency on the first invocation of an idle function; mitigate with Provisioned Concurrency
- Execution timeout — maximum 15 minutes; design functions to complete well within this
- Memory — 128MB to 10GB; CPU scales proportionally with memory allocation
- Concurrency — default 1000 concurrent executions per region; request increases as needed
- Environment variables and AWS Secrets Manager integration
- Lambda Layers — shared libraries/dependencies reused across multiple functions

```js
// Node.js Lambda handler
export const handler = async (event, context) => {
  const { httpMethod, path, body, pathParameters } = event;

  if (httpMethod === "GET" && path === "/health") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ok" }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Route not found" }),
  };
};
```

#### API Gateway

A fully managed service that acts as the front door for Lambda functions or HTTP backends.

- REST API vs HTTP API — HTTP API is cheaper, faster to configure, and simpler; prefer it for new projects
- Routes and integrations — map HTTP routes to Lambda functions, ALBs, or external HTTP endpoints
- Authorizers — JWT authorizer (validate tokens without writing code), Lambda authorizer (custom logic)
- Throttling — default 10,000 requests/second per account, configurable per stage
- CORS — configure allowed origins, methods, and headers at the API Gateway level
- Stages and deployments — `dev`, `staging`, `prod` stages with independent configurations
- Usage plans and API keys — rate limit specific consumers with API key-based quotas

#### ECS (Elastic Container Service)

Run Docker containers on AWS without managing Kubernetes infrastructure.

- Fargate launch type — serverless containers; AWS manages the underlying infrastructure; start here
- EC2 launch type — deploy containers onto EC2 instances you manage; more control, more work
- Task Definitions — JSON configuration specifying image, CPU, memory, env vars, ports, logging
- Services — maintain N running tasks; integrate with ALB for load balancing; roll out updates gradually
- ECR (Elastic Container Registry) — private Docker image registry integrated with ECS and IAM

```json
{
  "family": "api-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "123456789.dkr.ecr.ap-south-1.amazonaws.com/myapp:latest",
      "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
      "environment": [{ "name": "NODE_ENV", "value": "production" }],
      "secrets": [
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:ap-south-1:123456789:secret:db-url" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/api",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### EKS (Elastic Kubernetes Service)

Managed Kubernetes on AWS. The control plane (API server, etcd) is managed by AWS. You manage the worker nodes (EC2 or Fargate).

- `eksctl` — CLI tool to create and manage EKS clusters with one command
- Managed node groups vs self-managed nodes vs Fargate profiles
- EKS + ECR — pull private images with no extra configuration via IAM roles
- ALB Ingress Controller — provision an AWS ALB automatically from a Kubernetes Ingress resource
- EKS Add-ons — CoreDNS, kube-proxy, VPC CNI, EBS CSI driver — managed by AWS

Use EKS after you are comfortable with Kubernetes concepts from Phase 10.

---

### AWS Phase 4 — Messaging & Events

#### SQS (Simple Queue Service)

Fully managed message queue. Decouple services and buffer traffic spikes.

- Standard queue — at-least-once delivery, best-effort ordering, nearly unlimited throughput
- FIFO queue — exactly-once delivery, strict ordering, 3000 messages/second
- Visibility timeout — the period a message is hidden from other consumers while being processed
- Dead Letter Queue (DLQ) — receive messages that fail processing after N retries
- Long polling — reduce empty receives by waiting up to 20 seconds for a message to arrive

```js
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "ap-south-1" });

await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.SQS_URL,
  MessageBody: JSON.stringify({ type: "send-email", userId: 1 }),
  MessageAttributes: {
    priority: { DataType: "String", StringValue: "high" }
  }
}));
```

#### SNS (Simple Notification Service)

Pub/Sub messaging — broadcast a message to many subscribers simultaneously.

- Topics — named channels that hold a message temporarily
- Subscriptions — SQS, Lambda, HTTP/HTTPS endpoint, email, SMS
- Fan-out pattern — one SNS publish triggers multiple SQS queues (one per downstream service)
- Message filtering — subscribers receive only messages matching their filter policy

#### EventBridge

A serverless event bus for routing events between AWS services, SaaS applications, and your own apps.

- Default event bus — receives AWS service events (EC2 state changes, RDS snapshots, etc.)
- Custom event buses — create dedicated buses per domain
- Rules — filter events by source/detail-type and route matching events to targets
- Targets — Lambda, SQS, ECS task, Step Functions, API Gateway, Kinesis, and more
- Scheduled rules — cron expressions for regular tasks (`cron(0 2 * * ? *)` = 2am UTC daily)

---

### AWS Phase 5 — Observability

#### CloudWatch

AWS's built-in logging, monitoring, and alerting service. The first place you check when something breaks.

- Log Groups and Log Streams — collect logs from Lambda, ECS, EC2, API Gateway automatically
- Metrics — built-in metrics for every AWS service; create custom metrics from your app
- Alarms — trigger SNS notifications or Auto Scaling actions when a metric crosses a threshold
- Dashboards — build visual dashboards combining metrics from multiple services
- CloudWatch Logs Insights — query your logs with a SQL-like syntax

```
# Find 5xx errors in the last hour
fields @timestamp, @message
| filter @message like /statusCode":5/
| sort @timestamp desc
| limit 100
```

#### X-Ray

Distributed tracing — visualise the full path of a request as it travels through Lambda, SQS, RDS, and external HTTP calls.

- Traces and segments — a trace groups all segments from a single request end-to-end
- Service map — auto-generated graph showing latency and error rate between services
- Subsegments — trace individual database queries, HTTP calls, or custom code blocks
- Sampling rules — trace a percentage of requests in production to control cost

---

### AWS Phase 6 — Infrastructure as Code

Never provision AWS resources by clicking through the console in production. Define everything as code so it is repeatable, reviewable, and version-controlled.

#### Terraform

Cloud-agnostic IaC tool. Defines infrastructure in HCL (HashiCorp Configuration Language). Works with AWS, GCP, Azure, and hundreds of providers.

- `terraform init` — download providers and modules
- `terraform plan` — preview what will change before applying
- `terraform apply` — create or update real infrastructure
- `terraform destroy` — tear down all managed resources
- State files — Terraform tracks what it has created; store state remotely in S3 + DynamoDB for teams
- Modules — reusable, parameterised infrastructure components

```hcl
# main.tf — provision a VPC, EC2 instance, and security group
provider "aws" {
  region = "ap-south-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "main-vpc" }
}

resource "aws_security_group" "api_sg" {
  name   = "api-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "api" {
  ami                    = "ami-0f5ee92e2d63afc18"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.api_sg.id]
  tags = { Name = "api-server" }
}
```

#### AWS CDK (Cloud Development Kit)

Define AWS infrastructure using TypeScript (or Python, Java, Go). CDK synthesises your code into CloudFormation templates.

- Constructs — reusable infrastructure components at three levels (L1 raw CFN, L2 sane defaults, L3 patterns)
- Stacks — a unit of deployment; one CDK app can have multiple stacks
- `cdk synth` — generate CloudFormation template
- `cdk diff` — preview infrastructure changes
- `cdk deploy` — deploy to AWS

```ts
import * as cdk    from "aws-cdk-lib";
import * as ec2    from "aws-cdk-lib/aws-ec2";
import * as ecs    from "aws-cdk-lib/aws-ecs";
import * as ecsp   from "aws-cdk-lib/aws-ecs-patterns";

const app   = new cdk.App();
const stack = new cdk.Stack(app, "ApiStack", { env: { region: "ap-south-1" } });

const vpc     = new ec2.Vpc(stack, "Vpc", { maxAzs: 2 });
const cluster = new ecs.Cluster(stack, "Cluster", { vpc });

// L3 construct — VPC + ALB + ECS Service with one block
new ecsp.ApplicationLoadBalancedFargateService(stack, "ApiService", {
  cluster,
  cpu:            512,
  memoryLimitMiB: 1024,
  desiredCount:   2,
  taskImageOptions: {
    image: ecs.ContainerImage.fromRegistry("myapp/api:latest"),
    containerPort: 3000,
  },
  publicLoadBalancer: true,
});
```

---

### AWS Certification Path

Certifications are optional but valuable for validating your knowledge and standing out in the job market.

```
Cloud Practitioner (CLF-C02)
  ↓  Start here if you have zero cloud experience
Solutions Architect Associate (SAA-C03)   ← most recognised, covers all core services
  ├──→ Developer Associate (DVA-C02)      ← Lambda, CodePipeline, CI/CD focus
  └──→ SysOps Administrator (SOA-C02)     ← monitoring, operations focus
            ↓
  Solutions Architect Professional        ← advanced, for senior engineers
```

The **SAA-C03** (Solutions Architect Associate) is the best starting certification for backend engineers. It covers IAM, VPC, EC2, S3, RDS, ECS, Lambda, ALB, and more — exactly the services in this roadmap.

---

## Full Roadmap at a Glance

```
Phase 1   JavaScript / TypeScript
          └── ES6+, async/await, event loop, types, generics, decorators

Phase 2   Node.js → Express.js
          └── Event loop, streams, core modules, routing, middleware, REST

Phase 3   Auth & API Design
          └── JWT, bcrypt, OAuth 2.0, HTTP methods, status codes, versioning

Phase 4   NestJS
          └── Modules, controllers, guards, interceptors, pipes, DI

Phase 5   Databases
          ├── PostgreSQL  → SQL, indexes, transactions, migrations
          ├── MongoDB     → documents, aggregation, Mongoose
          └── ORM         → Prisma / TypeORM

Phase 6   Caching & Messaging
          ├── Redis   → caching, sessions, BullMQ job queues
          └── Kafka   → event streaming, topics, consumers

Phase 7   Testing
          └── Jest / Vitest, Supertest, unit → integration → E2E

Phase 8   Docker
          └── Dockerfile, multi-stage builds, docker-compose, registries

Phase 9   Nginx
          └── Reverse proxy, SSL termination, rate limiting, load balancing

Phase 10  Kubernetes + CI/CD
          ├── Pods, deployments, services, ingress, HPA, Helm
          └── GitHub Actions → test → build → push → deploy

Phase 11  AWS
          ├── Core:        IAM, EC2, VPC, S3, RDS
          ├── Scaling:     ELB, Auto Scaling Groups
          ├── Serverless:  Lambda, API Gateway, ECS, EKS
          ├── Messaging:   SQS, SNS, EventBridge
          ├── Observability: CloudWatch, X-Ray
          └── IaC:         Terraform / AWS CDK
```

---

*Build something real at every phase. Reading about Docker is not the same as containerising your own Node.js app and watching it run. The backend world is deep — but it rewards consistent, hands-on progress.*