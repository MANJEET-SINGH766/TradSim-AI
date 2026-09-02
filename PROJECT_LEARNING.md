# TradeSim AI — Learning State

## Student
Beginner B.Tech final-year student.

## Goal
Understand the complete TradeSim AI codebase deeply:
- architecture
- frontend
- backend
- APIs
- database
- authentication
- trading logic
- mathematical analysis
- Gemini integration
- deployment
- debugging

## Teaching Rules

1. Teach one step at a time.
2. Use actual project code.
3. Explain beginner concepts first.
4. Explain WHY code exists, not only WHAT it does.
5. Trace complete data flow.
6. Do not modify code unless explicitly requested.
7. After each lesson mark progress.
8. Stop after each lesson and wait for NEXT.

## Current Progress

[x] Phase 1 — Complete User Flow
[x] Phase 2 — Frontend
[x] Phase 3 — Frontend ↔ Backend
[x] Phase 4 — Backend
[x] Phase 5 — Stock Data
[ ] Phase 6 — Gemini/Prompt Engineering
[ ] Phase 7 — Order Trigger Logic
[ ] Phase 8 — Database
[ ] Phase 9 — Authentication/Security
[ ] Phase 10 — Error Handling
[ ] Phase 11 — Deployment
[ ] Phase 12 — Complete Request Trace
[ ] Phase 13 — Code Deep Dive
[ ] Phase 14 — Architecture
[ ] Phase 15 — Debugging
[ ] Phase 16 — Interview Preparation

## Current Phase

Phase 6 — Gemini/Prompt Engineering

## Current Lesson

Phase 6, Lesson 1: Google Gemini SDK integration, structured prompt engineering for stock & portfolio analysis, and markdown generation.

## Last Completed Lesson

Phase 5, Lesson 1: Ticker search logic, historical price processing, and database caching patterns for market quotes.

## Important Understanding

- **Complete Data Flow (Login)**: React form submit (`LoginPage.tsx`) -> `useAuth()` hook (`AuthContext.tsx`) -> Next.js config proxy rewrite -> Express app (`app.ts` / `authRoutes.ts`) -> Zod schema validation -> Database check via Mongoose (`User.ts`) -> `bcrypt` verification -> JWT creation -> Session set via Secure HttpOnly cookie -> Frontend redirect to `/dashboard`.
- **Security Principles**: Using HTTP-Only cookies to secure JWTs against XSS attacks, and hashing passwords using `bcrypt` to prevent plaintext exposure.
- **Validation Principles**: Why backend validation (Zod) is required even with frontend validation (defense in depth).
- **Next.js App Router & Layouts**: File-system based routes where nested folders map to paths. The root [`layout.tsx`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/frontend/src/app/layout.tsx) is a layout template that stays mounted across routing to preserve state (like `AuthProvider`) and optimize fonts (Geist).
- **Tailwind CSS v4 Styling**: Uses a CSS-first approach declaring theme variables directly in [`globals.css`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/frontend/src/app/globals.css).
- **Persistent Frame vs Dynamic Child**: [`AppLayout.tsx`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/frontend/src/components/AppLayout.tsx) serves as the navigation and global stats frame, while [`page.tsx`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/frontend/src/app/dashboard/page.tsx) handles dynamic child views like holdings, recommended assets, activity ledger, and Recharts asset allocation.
- **Client Side State Synchronization**: Using React lifecycle hooks (`useEffect`) and fetch options (`credentials: 'include'`) to synchronize authorization cookies and trigger parallel REST requests.
- **Interactive Detail Views**: [`stocks/[symbol]/page.tsx`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/frontend/src/app/stocks/%5Bsymbol%5D/page.tsx) uses dynamic router parameters to retrieve quote details, historical chart data, and Gemini-based analyses for specific ticker symbols.
- **Gradient Area Charting**: Implements responsive `<AreaChart>` using Recharts to present price charts. It dynamically colors the gradient based on positive or negative daily returns.
- **Dynamic Order Tickets**: Evaluates order criteria (Market, Limit, Stop-Loss), calculates projected costs on-the-fly, validates client balances, forwards POST payloads to `/orders`, and uses context callbacks (`updateBalance`) to update the global balance on immediate market executions.
- **Next.js Reverse Proxy Gateway**: Using `next.config.ts` rewrites to proxy client-side `/api/v1/*` requests to the remote hosted Express endpoint. This bypasses client-side Same-Origin policy checks while maintaining session context.
- **Cross-Origin Resource Sharing (CORS)**: Configuring `cors` with `credentials: true` and dynamic origins (localhost, Vercel, Render) allows secure cross-origin HTTP-Only cookie transfer.
- **HTTP-Only Session Cookies**: Hiding JWT tokens behind the `httpOnly: true` flag blocks client-side JavaScript access (defending against XSS attacks) while configuring `secure` and `sameSite: 'none'` in production ensures encrypted cross-site transfer.
- **Token Interception Middleware**: Using cookie-parser and Express authentication middleware to intercept, verify, and validate Mongoose user models before routes handle requests.
- **Modular API Routing**: Segmenting REST endpoints into domain-specific router modules (e.g. [`authRoutes.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/routes/authRoutes.ts)) that map clean HTTP request verbs directly to controller actions.
- **Controller Action Pattern**: Decoupling route definitions from business logic handler functions (e.g., [`orderController.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/controllers/orderController.ts)), relying on async try-catch wrappers and Express `next(error)` pipelines to capture and propagate execution errors.
- **Runtime Schema Enforcement**: Utilizing declarative schemas with Zod (e.g. validation schemas inside [`authController.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/controllers/authController.ts)) to strictly format request body inputs and run complex conditional checks (using `.refine()`) before database execution, handling violations via structured `VALIDATION_ERROR` responses.
- **Database Model Mapping**: Creating typed Mongoose schemas and interface models (e.g., [`PendingOrder.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/models/PendingOrder.ts)) that enforce business constraints, configure performance indexes, and bind MongoDB documents directly to active TypeScript query interfaces.
- **Separation of Services**: Decoupling REST controllers from raw computations and database mutations by routing business logic into discrete service classes (e.g., [`marketService.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/services/marketService.ts) and [`tradingService.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/services/tradingService.ts)).
- **Transactional Programmatic Rollbacks**: Emulating transactional safety in a single-instance MongoDB environment by programmatically reverting write operations (such as refunding cash balances or restoring share quantities) within try-catch blocks if subsequent schema inserts fail.
- **Market Data Sanitization & Exchange Filtering**: Using `yahoo-finance2` to search equities while enforcing suffix filtering (`.NS` for National Stock Exchange and `.BO` for Bombay Stock Exchange) to restrict simulation data to Indian markets.
- **Chart Data Chronological Normalization**: Calculating dynamic start/end ISO date boundaries (`1W`, `1M`, `1Y`), filtering undefined candles, and applying `.sort()` by timestamp to guarantee ascending order for Recharts.
- **Time-To-Live (TTL) Database Caching Pattern**: Querying MongoDB collections with time boundaries (`createdAt: { $gte: twentyFourHoursAgo }`) combined with atomic upserts (`findOneAndUpdate` with `upsert: true`) to avoid redundant third-party API calls and minimize latency.
- **Isolating Business Logic via Mocking**: Overriding external network-dependent dependencies (like [`marketService.ts`](file:///c:/Users/chauh/OneDrive/Desktop/TradeSim%20AI/backend/src/services/marketService.ts)) using Jest test mocks to stub return values, ensuring fast and deterministic test runs.
- **Atomic Test Lifecycle Guards**: Setting up connection hooks (`beforeAll`/`afterAll`) and database clearing resets (`beforeEach`) to ensure tests remain independent and state clean.
- **In-Memory Request Simulation**: Using `supertest` to test the full Express HTTP server pipeline (middleware gates, Zod checks, controllers, and MongoDB writes) without initiating physical port binding.
- **Security Guard Testing**: Validating authorization headers and cookie interceptors by verifying that unauthenticated REST requests trigger strict `401 Unauthorized` codes.

## Questions Struggled With

- None yet.

## Next Action

Start Phase 6, Lesson 1: Explore Google Gemini AI SDK integration, system prompts, markdown response formatting, and portfolio recommendation pipelines.