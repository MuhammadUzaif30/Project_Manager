# Team Issue & Project Management System

A simplified, Jira-style team issue tracker built as a full-stack MERN technical assessment. Supports multi-tenant organizations with role-based access control, projects, issues with full search/filter/sort/pagination, comments, an activity log, a dashboard, and real-time collaboration via Socket.IO.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Backend Setup](#backend-setup)
7. [Frontend Setup](#frontend-setup)
8. [Database Setup](#database-setup)
9. [Running Tests](#running-tests)
10. [API Overview](#api-overview)
11. [Authentication Approach](#authentication-approach)
12. [Authorization Approach](#authorization-approach)
13. [Socket.IO Implementation](#socketio-implementation)
14. [Database Design](#database-design)
15. [Important Technical Decisions](#important-technical-decisions)

## Project Overview

This application is a simplified Jira: users belong to **organizations**, organizations contain **projects**, projects contain **issues**, and issues support **comments**. Access is controlled by a per-organization role (Owner / Admin / Member) and, separately, by per-project membership. Changes to issues and comments propagate live to other connected users via Socket.IO, and an activity log records important actions across each organization and project. A dashboard surfaces aggregated, backend-computed statistics per project.

Visual polish was intentionally deprioritized in favor of correctness, authorization, backend architecture, database design, API quality, and real-time functionality, per the assessment's stated priority order.

## Technology Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT (jsonwebtoken), bcryptjs, express-validator, express-rate-limit, express-mongo-sanitize, cors

**Frontend:** React (Vite), React Router, TanStack Query (React Query), Axios, Socket.IO Client

**Testing:** Jest, Supertest, mongodb-memory-server

### Why these choices

- **TanStack Query** over Redux Toolkit/Zustand for client state: nearly all state in this app is server data (issues, projects, comments) rather than pure client UI state, and TanStack Query handles caching, refetching, loading/error states, and cache invalidation for that specific problem out of the box, without the boilerplate a general-purpose store would add.
- **bcryptjs** over native `bcrypt`: identical API and security properties, but pure JavaScript, avoiding native-module compilation issues on some machines.
- **mongodb-memory-server** for tests: gives every test run a real, disposable MongoDB instance, so tests exercise actual Mongoose queries and validation rather than mocks, without ever touching a real database.

## Architecture Overview

The backend follows a layered structure to keep concerns separated:

```
server/
  models/       — Mongoose schemas (data shape, validation, indexes)
  routes/       — URL → controller wiring only, no logic
  controllers/  — request handling and business logic
  middleware/   — auth, role checks, validation, error handling
  validators/   — express-validator rule sets per resource
  socket/       — Socket.IO authentication
  utils/        — shared helpers (e.g. activity logging)
  tests/        — Jest/Supertest test suites
  app.js        — builds the Express app (no side effects)
  server.js     — connects DB, starts Socket.IO, starts listening
```

Nested routers (`organizations` → `projects` → `issues` → `comments`) mirror the data's real nesting, using `express.Router({ mergeParams: true })` so URL parameters flow down through each level. Authorization is layered and composable:

```
authenticate            → who is making this request
requireOrgRole(role)     → are they in this organization, at what level
loadProject              → does this project actually belong to this organization
requireProjectMember     → can this specific user see this specific project
```

Each layer is a small, independently reusable middleware, chained together per route rather than duplicated per controller.

`app.js` exports a pure, side-effect-free Express application (no DB connection, no listening port), separate from `server.js`, which handles connecting to MongoDB, starting Socket.IO, and starting the actual server. This split is what allows the test suite to import and exercise the app directly via Supertest without a real network connection.

The frontend mirrors the same separation-of-concerns principle:

```
client/src/
  api/          — raw axios calls per resource, one file per resource
  hooks/        — TanStack Query wrappers (useQuery/useMutation) per resource
  components/   — small, reusable presentational pieces
  pages/        — route-level components that compose hooks + components
  context/       — app-wide state: AuthContext, SocketContext
```

## Installation

### Prerequisites

- Node.js v18 or later
- A MongoDB Atlas account (free tier is sufficient), or a local MongoDB instance
- Git

### Clone and enter the project

```
git clone <your-repo-url>
cd mern-issue-tracker
```

## Environment Variables

The backend needs a `.env` file inside `/server`. A template is provided at `server/.env.example`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_random_jwt_secret_here
```

Copy it and fill in real values:

```
cd server
cp .env.example .env
```

- `PORT` — the port the backend listens on (defaults to 5000 if omitted).
- `MONGO_URI` — your MongoDB Atlas (or local) connection string, including a database name (e.g. `.../issuetracker?retryWrites=true&w=majority`).
- `JWT_SECRET` — a long, random signing secret. Generate one with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env` is git-ignored and must never be committed. `.env.example` intentionally is committed, with placeholder values only.

## Backend Setup

```
cd server
npm install
npm run dev
```

This starts the Express + Socket.IO server on `http://localhost:5000` with `nodemon` (auto-restart on file changes). Use `npm start` instead for a plain, non-restarting run.

On startup you should see both `MongoDB connected` and `Server running on http://localhost:5000` logged to the console.

## Frontend Setup

In a separate terminal:

```
cd client
npm install
npm run dev
```

This starts the Vite dev server, by default on `http://localhost:5173`. Open that URL in your browser.

Both the backend and frontend dev servers must be running simultaneously for the app to work.

## Database Setup

No manual schema or migration step is required. Mongoose creates collections and indexes automatically the first time each model is used, based on the schemas defined in `server/models/`. Simply point `MONGO_URI` at any accessible MongoDB Atlas cluster (or local instance) — an empty database is fine, and the app will populate it as you use it.

If using MongoDB Atlas, make sure to:

1. Create a database user (Database Access) with a password.
2. Whitelist your IP address, or allow access from anywhere for local development (Network Access → `0.0.0.0/0`).

## Running Tests

```
cd server
npm test
```

Tests run against a temporary, in-memory MongoDB instance provided by `mongodb-memory-server` — no connection to your real `MONGO_URI` database is made or required during testing, and no real data is at risk.

Test coverage includes:

- **Authentication:** successful registration, duplicate-email rejection, invalid-input rejection, successful login, invalid-credential rejection, protected-endpoint access with/without a valid token.
- **Authorization:** cross-organization access denial, cross-organization project access (404, not 403, by design), Member-vs-Admin permission boundaries for project creation and organization member management, unauthorized issue update/delete attempts.
- **Issues:** creation (valid and invalid input), updates (valid and invalid), filtering (by status, priority, combined filters, text search), and pagination (default behavior, custom page size, correct non-overlapping pages, enforced maximum page size).

## API Overview

All endpoints are prefixed with `/api`. Representative routes (all further nested routes follow the same pattern):

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in, receive a JWT |
| GET | `/auth/me` | Get the current authenticated user |
| GET, POST | `/organizations` | List / create organizations |
| GET, POST | `/organizations/:orgId/members` | List / add organization members |
| PATCH | `/organizations/:orgId/members/:userId/role` | Change a member's role |
| DELETE | `/organizations/:orgId/members/:userId` | Remove a member |
| GET, POST | `/organizations/:orgId/projects` | List / create projects |
| GET, PATCH, DELETE | `/organizations/:orgId/projects/:projectId` | View / update / delete a project |
| POST, DELETE | `/organizations/:orgId/projects/:projectId/members[/:userId]` | Add / remove project members |
| GET, POST | `/.../projects/:projectId/issues` | List (with filters/sort/pagination) / create issues |
| GET, PATCH, DELETE | `/.../issues/:issueId` | View / update / delete an issue |
| GET, POST, PATCH, DELETE | `/.../issues/:issueId/comments[/:commentId]` | Comment CRUD |
| GET | `/.../projects/:projectId/dashboard` | Aggregated project statistics |
| GET | `/.../projects/:projectId/activity` | Project-level activity feed |
| GET | `/organizations/:orgId/activity` | Organization-level activity feed |

**Issue list query parameters:** `?status=&priority=&assignee=&label=&search=&sortBy=&order=&page=&limit=`

All success responses are shaped as `{ <resourceName>: {...} }`; error responses are shaped as `{ message: "..." }`, except validation failures, which return `{ errors: [...] }` (an array of field-level error objects from express-validator).

## Authentication Approach

Authentication is stateless, JWT-based:

1. On register/login, the server verifies credentials (hashing passwords with bcrypt, never storing plaintext) and signs a JWT containing the user's ID, valid for 7 days.
2. The client stores this token in `localStorage` and attaches it automatically to every request via an axios request interceptor (`Authorization: Bearer <token>`), so individual API calls never need to manage this manually.
3. The `authenticate` middleware verifies the token's signature on every protected request and re-fetches the user from the database (rather than trusting the token payload alone), so a deleted user's token stops working immediately instead of remaining valid until natural expiry.
4. An axios response interceptor watches for any `401` response globally, clears the stale token, and redirects to `/login` — centralizing session-expiry handling instead of scattering it across every page.

## Authorization Approach

Two independent, composed layers of authorization:

1. **Organization-level roles** — Owner, Admin, Member — stored on a dedicated `Membership` model rather than embedded on `User` or `Organization`, since a single user can belong to multiple organizations with a different role in each, and a role needs to be queried and updated independently of both the user and the organization documents. Enforced by `requireOrgRole(minimumRole)`, a middleware factory using a numeric role-weight system (Owner=3, Admin=2, Member=1), so a route requiring "at least Member" is automatically satisfied by an Admin or Owner too.
2. **Project-level membership** — independent of organization role — determines which specific projects a plain Member can see and act on (Admins/Owners see and manage every project in their organization regardless of explicit membership). Stored as a `members` array directly on the `Project` model.

Every organization- and project-scoped query explicitly filters by the relevant organization/project ID pulled from route middleware (`req.membership`, `req.project`), not just by the target resource's own ID — this is what prevents a user from reaching another organization's data by manipulating IDs in the URL, and is directly covered by the authorization test suite (`tests/authorization.test.js`).

Frontend role checks (hiding buttons, disabling forms) exist purely to keep the UI honest and uncluttered. They are not a security boundary — the backend enforces every rule independently, which is verified by tests that call the API directly with tokens for different roles, entirely bypassing the UI.

## Socket.IO Implementation

Socket connections are authenticated via a dedicated Socket.IO middleware (`io.use(socketAuth)`), mirroring the HTTP `authenticate` middleware: it verifies a JWT passed via `socket.handshake.auth.token` before accepting the connection at all.

Once connected, a client explicitly emits `joinProject` with a project ID when viewing that project. The server independently re-verifies the user's actual access to that project (a database check equivalent to the `requireProjectMember` HTTP middleware) before joining their socket to a room named `project:<projectId>` — real-time access is never assumed just because a REST request once succeeded.

All real-time events — `issue:created`, `issue:updated`, `issue:deleted`, `comment:created` — are broadcast only to that specific room via `io.to(room).emit(...)`, guaranteeing a user only receives events for organizations/projects they're actually authorized to access, not merely blocked from directly fetching via REST.

On the frontend, incoming events trigger `queryClient.invalidateQueries(...)` (TanStack Query) rather than manually merging the event's payload into cached state. This is a deliberate trade-off: it costs one extra network round-trip per event, but avoids an entire class of subtle bugs around correctly merging a partial update into a paginated, filtered, and sorted list client-side.

## Database Design

Collections: `User`, `Organization`, `Membership`, `Project`, `Issue`, `Comment`, `ActivityLog`.

```
User ──< Membership >── Organization
                              │
                              └──< Project >── (members: [User])
                                      │
                                      ├──< Issue >── assignee / reporter: User
                                      │       │
                                      │       └──< Comment >── author: User
                                      │
                                      └──< ActivityLog >── user: User
```

(`──<` denotes a one-to-many relationship.)

### Key decisions

- **`Membership` as a dedicated join collection**, rather than an array of roles embedded on `User` or `Organization`. This is the standard representation for a many-to-many relationship that carries its own data (the role), and it's the only clean way to query "what is this user's role in this specific organization" directly — enforced by a compound unique index on `{ user, organization }`.
- **References over embedding** for anything unbounded — issues, comments, and activity log entries are all separate collections referencing their parent via ObjectId, rather than embedded arrays. An issue could accumulate hundreds of comments over its lifetime; MongoDB documents have a hard 16MB size cap, and large embedded arrays degrade write performance well before that limit is reached.
- **`Comment` stores a `project` reference directly, in addition to `issue`.** This is a deliberate denormalization: it lets authorization middleware validate a comment's project scope without an extra database lookup through its parent issue first, at the cost of a small amount of data duplication.
- **`ActivityLog` uses a generic `targetType` (string) + `targetId` (ObjectId) pair**, rather than a separate optional reference field for every possible target type (issue, comment, membership). One log entry needs to be able to point at any of several different kinds of resource; a fixed set of mostly-empty reference fields would be more rigid for no real benefit here.
- **Indexes are built around the application's actual query patterns**, not applied blanket-style:
  - `Issue`: `{ project, status }`, `{ project, assignee }`, `{ project, priority }` (all compound, since issues are always queried within a specific project first), plus a text index on `{ title, description }` for search.
  - `Project`: `{ organization }` — the most common project query is "all projects in this org."
  - `Comment`: `{ issue, createdAt }` — comments are always fetched per-issue, oldest first.
  - `ActivityLog`: `{ project, createdAt }` and `{ organization, createdAt }` — activity feeds are always "most recent first," scoped to a project or organization.
  - `Membership`: compound unique `{ user, organization }` — both a correctness constraint and the index backing every authorization check in the app.

## Important Technical Decisions

- **Last-Owner protection.** An organization's only remaining Owner cannot be removed or demoted, even by another Owner (if one exists) or by themselves. This isn't explicitly required by the spec, but prevents an organization from being permanently left without anyone able to manage it.
- **Comment moderation scope.** The spec requires that "users must not modify another user's comments unless their role explicitly permits the operation," without specifying which roles that includes. This implementation allows Admins and Owners to edit/delete any comment within their organization's projects, treating this as reasonable moderation capability — an explicit interpretation, not an oversight.
- **Organization invitations require an existing account.** `addMember` looks up the invited person by email and requires them to already be registered, rather than implementing a full email-invitation flow for non-users. This was a deliberate scope decision given the one-day time budget.
- **Centralized error handling.** A single Express error-handling middleware (`middleware/errorHandler.js`) formats Mongoose `ValidationError`, `CastError`, and duplicate-key (`11000`) errors into consistent, appropriately-coded JSON responses (400/409 rather than a generic 500), acting as a safety net behind per-field validators.
- **Rate limiting on authentication endpoints.** `POST /auth/login` and `POST /auth/register` are limited to 10 requests per 15 minutes per IP, to slow down brute-force credential attempts without meaningfully affecting legitimate use.
- **Dashboard statistics use `countDocuments`/aggregation queries**, never full-collection fetches, so that computing simple counts doesn't require transferring the entire issue dataset to the frontend — this remains performant regardless of how many issues a project accumulates.
