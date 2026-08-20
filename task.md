# TradeSim AI - Detailed Learning Plan & Task Tracker

This roadmap breaks down our stock paper-trading simulator project into highly granular, manageable steps. We will check off these steps one by one as we build them, ensuring we understand the underlying engineering concepts behind each line of code.

---

## Phase 1: Project Scaffolding
- [x] **Step 1.1: Backend package configuration (`package.json`)**
  * *Goal:* Define app details, run scripts, and install core backend libraries (Express, Mongoose, Bcryptjs, JWT, Zod, and development TypeScript tools).
- [x] **Step 1.2: TypeScript compiler settings (`tsconfig.json`)**
  * *Goal:* Tell the TypeScript compiler how to compile our files, what target JS version to generate (`ES2022`), and how strict to check type definitions.
- [x] **Step 1.3: Backend environment variables (`.env` and `.env.example`)**
  * *Goal:* Setup local config configurations (port, DB string, session keys) in an environment file. Explain why we never check `.env` into git.
- [x] **Step 1.4: Base Express application (`src/app.ts` and `src/server.ts`)**
  * *Goal:* Instantiate Express, mount security middleware (CORS, parser, cookies), and set up a server listener that starts up the API.
- [x] **Step 1.5: Next.js Frontend scaffolding**
  * *Goal:* Initialize a clean Next.js app with App Router, TypeScript, and Tailwind CSS. Learn about Next.js structure.

---

## Phase 2: Database Design & Mongoose Setup
- [x] **Step 2.1: Establish Mongoose Connection**
  * *Goal:* Connect our Express server to our MongoDB database and handle successful/failed connection states.
- [x] **Step 2.2: Create `User` Schema & Model**
  * *Goal:* Write user data schemas containing validation rules for email, username, and register date. Set the default virtual balance to ₹10,00,000.
- [x] **Step 2.3: Create `Holding` Schema & Model**
  * *Goal:* Design schema tracking owned stocks per user. Implement a compound unique index `{ userId: 1, symbol: 1 }` to prevent duplicate tracking rows.
- [x] **Step 2.4: Create `Transaction` Schema & Model**
  * *Goal:* Implement the ledger structure keeping track of executed market orders (type, quantity, execution price, total value, and realized gains).
- [x] **Step 2.5: Create `Watchlist` Schema & Model**
  * *Goal:* Create a model mapping user IDs to arrays of tickers.
- [x] **Step 2.6: Create `AIAnalysis` Schema & Model**
  * *Goal:* Design cache schemas to store OpenAI responses for stocks and portfolios to save API tokens.

---

## Phase 3: Vertical Slice 1 - Authentication
- [x] **Step 3.1: Password Hashing Logic**
  * *Goal:* Learn about cryptographic hashing. Use `bcryptjs` to securely hash password strings before saving them to MongoDB.
- [x] **Step 3.2: JWT Generation & Secure HTTP-only Cookie Storage**
  * *Goal:* Write functions to issue JSON Web Tokens (JWT) containing user identifiers and configure the server to return them as HttpOnly cookies.
- [x] **Step 3.3: Authentication Middleware (`authenticate`)**
  * *Goal:* Write Express middleware that checks the incoming cookie, decodes the JWT, and loads the active user data onto the request object (`req.user`).
- [x] **Step 3.4: Write Auth API Endpoints**
  * *Goal:* Bind authentication routes (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`) to controllers and test them via HTTP requests.
- [x] **Step 3.5: Frontend Authentication Context (`AuthContext`)**
  * *Goal:* Build a React Context in Next.js to share user session data and cash balance with dashboard pages.
- [x] **Step 3.6: Next.js Middleware Route Protection**
  * *Goal:* Write Next.js middleware checking for user session cookies, redirecting logged-out visitors to `/login` automatically.
- [x] **Step 3.7: Create Auth User Interface (UI)**
  * *Goal:* Build login and signup views with custom responsive styles using Tailwind CSS.

---

## Phase 4: Vertical Slice 2 - Market Data Integration
- [x] **Step 4.1: Integrate Yahoo Finance Service**
  * *Goal:* Write backend service utility wrapping the `yahoo-finance2` package to fetch quotes and search results.
- [x] **Step 4.2: Build Search Stocks API (`GET /stocks?query=...`)**
  * *Goal:* Build stock lookup route returning Indian tickers matching a user query string.
- [x] **Step 4.3: Build Stock Quote Detail API (`GET /stocks/:symbol`)**
  * *Goal:* Build route returning current price, change, day range, and open price.
- [x] **Step 4.4: Build Stock Price History API (`GET /stocks/:symbol/history`)**
  * *Goal:* Build route returning daily close values for charts over selected intervals (e.g. 1W, 1M, 1Y).
- [x] **Step 4.5: Frontend Stock Detail Page & Charts**
  * *Goal:* Build Next.js page for individual tickers showing price widgets and historical charts using Recharts.
- [x] **Step 4.6: Frontend Global Search bar**
  * *Goal:* Build auto-completing stock search input inside the navigation layout.

---

## Phase 5: Vertical Slice 3 - V1 Trading Engine
- [x] **Step 5.1: Transaction Atomicity Service**
  * *Goal:* Learn about transaction isolation. Write logic updating cash and holdings atomically to ensure no money is lost/created on failures.
- [x] **Step 5.2: BUY Market Order Logic**
  * *Goal:* Code the purchase service: fetches current price, verifies user cash balance, decrements balance, and upserts the holding record.
- [x] **Step 5.3: SELL Market Order Logic**
  * *Goal:* Code the sale service: checks current price, verifies quantity held, increments cash balance, decrements holding, and computes realized P&L.
- [x] **Step 5.4: Build Orders Endpoint (`POST /orders`)**
  * *Goal:* Create the API entry point for ordering, validated via Zod schema payloads.
- [x] **Step 5.5: Frontend Buy/Sell Trade Ticket**
  * *Goal:* Design order card widget on individual Stock pages allowing users to select quantities and submit market trades.

---

## Phase 6: Vertical Slice 4 - Portfolio, Dashboard, and History
- [x] **Step 6.1: Portfolio Valuation Service**
  * *Goal:* Write database aggregation functions to summarize cash balance and calculate real-time net assets of all holdings based on current prices.
- [x] **Step 6.2: Portfolio Summary Endpoint (`GET /portfolio`)**
  * *Goal:* API returning total return rates, current asset valuations, and unrealized profit/loss splits.
- [x] **Step 6.3: Get Transactions API (`GET /transactions`)**
  * *Goal:* API endpoint returning the user's past trade history log.
- [x] **Step 6.4: Frontend Dashboard Layout**
  * *Goal:* Design the main screen with cards showing total net assets, virtual cash remaining, net P&L metrics, and overall return.
- [x] **Step 6.5: Frontend Active Holdings List**
  * *Goal:* Render table listing currently owned stocks, average buy price, current market price, and unrealized returns.
- [x] **Step 6.6: Frontend Transaction Ledger View**
  * *Goal:* Render log table displaying chronological cards of all previous stock transactions.

---

## Phase 7: Watchlist & AI Assistant
- [x] **Step 7.1: Watchlist Endpoints (`GET`, `POST`, `DELETE` /watchlist)**
  * *Goal:* Add routes allowing users to keep track of symbols.
- [x] **Step 7.2: Frontend Watchlist Widgets**
  * *Goal:* Add toggle button to stock pages and render user tracking lists on dashboard feeds.
- [x] **Step 7.3: Backend OpenAI Service Helper**
  * *Goal:* Set up anonymous prompts to feed financial metrics (excluding personal identifiers) to OpenAI.
- [x] **Step 7.4: AI Stock Analysis Route & UI**
  * *Goal:* Endpoint returning ChatGPT summaries on tickers and render it as an overlay panel on stock views.
- [x] **Step 7.5: AI Portfolio Review Route & UI**
  * *Goal:* Endpoint providing reviews of user diversifications and render it on dashboard summaries.

---

## Phase 8: Testing & Security Audits
- [x] **Step 8.1: Backend Mathematical Unit Tests**
  * *Goal:* Write Jest unit tests verifying average cost recomputations, profit calculation edge cases, and portfolio aggregators.
- [x] **Step 8.2: Backend API Integration Tests**
  * *Goal:* Write Supertest integration tests confirming error responses for orders (e.g. buying without funds, selling without stock).
- [x] **Step 8.3: Rate Limiting & Query Injection Defense**
  * *Goal:* Configure security modules (`express-rate-limit`, `helmet`, input sanitization) to harden APIs.

---

## Phase 9: Deployment & Portfolio Polish
- [x] **Step 9.1: Staging Readiness Check**
  * *Goal:* Verify compiling, environment variables, and build integrity in staging mode.
- [x] **Step 9.2: Complete documentation (README)**
  * *Goal:* Create comprehensive documentation containing schema diagrams, REST routes, and setup instructions.
