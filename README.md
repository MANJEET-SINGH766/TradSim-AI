# TradeSim AI 📈🤖

TradeSim AI is a modern, full-stack virtual paper trading simulator designed for Indian Equities. It enables users to learn market dynamics, look up historical pricing charts, manage watchlists, execute virtual trades, and review portfolio asset allocations using real-time OpenAI analysis.

---

## 🌟 Key Features

*   **Real-Time Stock Search & Quotes**: Fetch quotes for Indian stocks (NSE/BSE tickers ending in `.NS` or `.BO`) using the free `yahoo-finance2` package.
*   **Interactive Price Charts**: Modern interactive area graphs mapping `1W`, `1M`, and `1Y` historical close trends powered by `Recharts` (fully optimized for Next.js SSR configurations).
*   **Virtual Trading Engine**: Atomic execution ledger covering market `BUY` and `SELL` orders with manual database rollback safeguards (no replica set transaction requirements).
*   **Active Holdings & Ledger Ledger**: Detailed aggregate holding sheets calculating average purchase price, live asset values, and unrealized return splits.
*   **Interactive AI Market Analysis**: Generates two-sentence educational market commentaries on tickers using OpenAI `gpt-4o-mini`, backed by a 24-hour database cache to minimize API cost footprints.
*   **AI Portfolio Audits**: Automated portfolio reviews diagnosing asset concentration and providing beginner-friendly diversification advice.
*   **Cookie Session Security**: Session persistence using secure, HttpOnly, cross-origin cookies.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Next.js 15+ App Router), Tailwind CSS (Vanilla themes), Recharts, TypeScript.
*   **Backend**: Node.js, Express.js (TypeScript), Mongoose (MongoDB connector), Zod (Request validations), Jest (Unit & Integration testing).
*   **AI Integration**: OpenAI SDK (`gpt-4o-mini` API).

---

## 🚀 Installation & Local Setup

### Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port `27017`)

---

### Step 1: Clone the Repository

Download the project folder and navigate to its root directory:
```bash
cd "TradeSim AI"
```

---

### Step 2: Configure the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on our template:
   ```bash
   cp .env.example .env
   ```
4. Open the newly created `.env` file and set your keys:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tradesim
   JWT_SECRET=your_32_character_jwt_secret_passphrase
   OPENAI_API_KEY=your_openai_api_key_here
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

*(Note: If you do not have an OpenAI API key, leave the default key string. The backend will automatically return smart simulated analysis fallback messages so you can test features without error crashes.)*

---

### Step 3: Configure the Frontend

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

---

### Step 4: Run the Application

You need to run **both** servers in separate terminal windows.

#### Start the Backend Server:
```bash
cd backend
npm run dev
```
*(Displays `MongoDB Connected: localhost` and `Server running in development mode on port 5000`)*

#### Start the Frontend Server:
```bash
cd frontend
npm run dev
```
*(Displays `- Local: http://localhost:3000`)*

Open your browser and navigate to **`http://localhost:3000`** to register, login, and trade!

---

## 🧪 Running Automated Tests

We have written complete unit tests for our trading math and integration tests for route security.

To run the Jest test suite:
1. Ensure your local MongoDB is running.
2. Navigate to the backend folder and execute:
   ```bash
   cd backend
   npm test
   ```
*(Tests both math averagers and secure auth redirection endpoints)*

---

## 📂 Project Architecture

```
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection configuration
│   │   ├── controllers/     # Route controller endpoints (Auth, Stock, Orders, Portfolio, Watchlist)
│   │   ├── middleware/      # Auth guard filters
│   │   ├── models/          # Mongoose database schemas
│   │   ├── routes/          # REST Endpoint paths mapping
│   │   ├── services/        # Business logic math calculators (Market quotes, Trading, Portfolios, OpenAI)
│   │   ├── tests/           # Jest unit & Supertest route verifications
│   │   └── app.ts / server.ts
│   ├── jest.config.js       # Jest TS config presets
│   └── tsconfig.json        # TypeScript compiler configurations
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Page route views (dashboard, login, register, stocks, portfolio, transactions)
│   │   ├── components/      # UI components (debounced StockSearch dropdown)
│   │   ├── context/         # AuthContext provider handles auth states
│   │   └── middleware.ts    # Secure Next.js router redirections
```
