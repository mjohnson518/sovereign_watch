# Sovereign Watch

Real-time US Treasury debt analytics dashboard with AI-powered analysis.

## Features

- **Debt Composition** - Sankey diagram showing Treasury debt breakdown
- **50-Year Historical View** - Long-term debt trends and patterns
- **Maturity Wall Analysis** - Upcoming debt maturities by year
- **Auction Demand Tracking** - Bid-to-cover ratios and bidder composition
- **Inflation Analysis** - TIPS breakeven rates and real yields
- **AI Analyst** - Gemini-powered macro strategy insights

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, Shadcn UI
- **Database**: Vercel Postgres, Drizzle ORM
- **Visualization**: Plotly.js, Recharts
- **AI**: Vercel AI SDK, Google Gemini

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Vercel Postgres database (optional for development)

### Environment Variables

Create a `.env.local` file:

```bash
# Database (optional - app works without it)
POSTGRES_URL=postgres://...

# AI Chat (required for AI features)
GOOGLE_GENERATIVE_AI_API_KEY=your-key-here

# Cron Authentication (optional in dev)
CRON_SECRET=your-secret-here
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

```bash
# Generate migrations from schema
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Open database GUI
npx drizzle-kit studio
```

## API Reference

All API endpoints return JSON and support standard HTTP methods.

### Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Data APIs | 60 requests | 1 minute |
| Chat API | 20 requests | 1 minute |
| Health API | 120 requests | 1 minute |

Rate limit headers are included in responses:
- `X-RateLimit-Remaining`: Requests remaining in window
- `Retry-After`: Seconds until rate limit resets (on 429)

### Endpoints

#### GET /api/debt

Returns current total US debt figures.

**Response:**
```json
{
  "totalDebt": 36000000000000,
  "totalDebtFormatted": "$36.00T",
  "debtHeldByPublic": 28000000000000,
  "intragovernmental": 8000000000000,
  "lastUpdated": "2025-01-03"
}
```

#### GET /api/auctions

Returns auction demand data with bid-to-cover ratios.

**Query Parameters:**
- `timeframe` - `1y`, `3y`, `5y`, `10y` (default: `1y`)
- `types` - Comma-separated: `BILL,NOTE,BOND,TIPS,FRN,CMB` (default: `NOTE,BOND`)

**Response:**
```json
{
  "data": [
    {
      "date": "2025-01-02",
      "ratio": 2.45,
      "type": "NOTE",
      "term": "10-Year",
      "direct": 0.18,
      "indirect": 0.65,
      "dealers": 0.17
    }
  ],
  "stats": {
    "count": 52,
    "avgRatio": 2.38,
    "minRatio": 1.92,
    "maxRatio": 2.89,
    "medianRatio": 2.35,
    "belowThreshold": 3
  },
  "meta": {
    "computedAt": "2025-01-03T12:00:00Z",
    "timeframe": "1y",
    "securityTypes": ["NOTE", "BOND"],
    "source": "database"
  }
}
```

#### GET /api/maturity-wall

Returns debt maturity wall data by year.

**Query Parameters:**
- `years` - Number of years to include (1-30, default: 10)

**Response:**
```json
{
  "data": [
    {
      "year": 2026,
      "bills": 5000000000000,
      "notes": 2000000000000,
      "bonds": 500000000000,
      "tips": 200000000000,
      "frn": 100000000000,
      "total": 7800000000000
    }
  ],
  "meta": {
    "computedAt": "2025-01-03T12:00:00Z",
    "recordDate": "2025-01-02",
    "yearsIncluded": 10,
    "totalSecuritiesProcessed": 1234,
    "source": "database"
  }
}
```

#### GET /api/health

Returns fiscal health metrics.

**Response:**
```json
{
  "debtToGdp": 124.5,
  "interestExpense": 1100000000000,
  "averageInterestRate": 3.32,
  "yieldCurveSpread": 0.15,
  "realYield10y": 2.1,
  "breakeven10y": 2.3,
  "lastUpdated": "2025-01-03"
}
```

#### GET /api/ownership

Returns estimated debt ownership breakdown.

**Response:**
```json
{
  "domestic": {
    "federalReserve": { "amount": 5000000000000, "percentage": 14 },
    "mutualFunds": { "amount": 3500000000000, "percentage": 10 },
    "banks": { "amount": 2000000000000, "percentage": 5.5 }
  },
  "foreign": {
    "japan": { "amount": 1100000000000, "percentage": 3.1 },
    "china": { "amount": 800000000000, "percentage": 2.2 }
  },
  "lastUpdated": "2024-Q3"
}
```

#### POST /api/chat

AI-powered analysis endpoint.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What are the risks in the maturity wall?" }
  ],
  "context": "Optional chart context data"
}
```

**Response:** Server-Sent Events (streaming text)

**Limits:**
- Message length: 2000 characters max
- Context length: 10000 characters max
- Messages per conversation: 50 max

#### POST /api/cron/ingest

ETL ingestion endpoint (cron job).

**Headers:**
- `Authorization: Bearer <CRON_SECRET>`

## Data Sources

- **Treasury Fiscal Data API** - Live debt and auction data
  - `debt_to_penny` - Daily debt totals
  - `mspd_table_3_market` - Security details
  - `auctions_query` - Auction results
  - `avg_interest_rates` - Interest rates
  - `daily_treasury_yield_curve` - Yield curves

- **Fed Z.1 / TIC** - Ownership estimates (static)

## Architecture

```
src/
  app/
    api/           # API routes
    page.tsx       # Main dashboard
  components/
    views/         # Dashboard views
    charts/        # Chart components
    ai/            # AI chat panel
    ui/            # Shadcn components
  lib/
    db/            # Drizzle schema
    etl/           # Treasury API client
    types/         # TypeScript types
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Deployment

Deployed on Vercel. Push to main branch triggers automatic deployment.

## License

MIT
