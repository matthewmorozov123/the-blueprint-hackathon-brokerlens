# 🔎 BrokerLens

**Price the business. Show the reasoning.**

[![Live on Vercel](https://img.shields.io/badge/Live_on-Vercel-000000?logo=vercel)](https://brokerlens.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

![BrokerLens — transparent business valuation workspace](public/og.png)

🔗 **Live app:** https://brokerlens.vercel.app

BrokerLens turns owner-provided financials, business-quality signals, and sourced
market research into a preliminary small-business valuation. It shows the normalized
earnings, every multiple adjustment, the supporting evidence, and the complete path
from raw inputs to an estimated value range.

---

## Highlights

- 🧮 **Deterministic valuation engine** — calculates normalized Seller's Discretionary Earnings (SDE), starts every business at the same 3.00× anchor, and applies reproducible business-quality adjustments.
- 🔒 **Research-locked results** — the final multiple, value range, asking price, and explanations stay hidden until fresh market research succeeds. Changing an input locks the results again so old evidence cannot be mixed with new financials.
- 🌐 **Four-factor AI research** — researches industry transactions, local demand, labor conditions, and competition—exactly once each.
- 🛡️ **Server-enforced safeguards** — the server validates categories, evidence, URLs, and adjustment caps instead of trusting an AI-generated total.
- 🔗 **Complete source trail** — every approved webpage used for a finding is listed on its research card with a clickable full-page link.
- 🎚️ **Evidence-sensitive transaction scoring** — exact completed comparables can move the multiple more than related or broad evidence; weak or asking-price-only evidence receives a neutral adjustment.
- 🏢 **Real deal inputs** — accounts for inventory, FF&E, included real estate, excess assets, and debt assumed by the buyer after the earnings-based valuation.
- 🧭 **Custom-industry matching** — maps an unsupported custom industry to the closest broad supported category before research begins.
- 💾 **Browser-local projects** — save and reopen valuations without creating an account or sending project data to a database.
- 🌙 **Broker-ready interface** — responsive four-step workflow, dark mode, formatted currency inputs, revenue-growth calculator, and a preloaded demo.

## The problem

Small-business valuations are often presented as a single multiple with little
explanation. Owners may supply inconsistent financials, market comparables may be
broad or based only on asking prices, and AI-generated research can look authoritative
even when its evidence is weak.

That makes it difficult for a broker to answer the questions that matter: What earnings
were normalized? Why did the multiple move? Which sources support the market view? Is
the evidence a completed sale, a related industry, or only a listing?

## How BrokerLens helps

- **Normalizes the earnings.** BrokerLens calculates SDE from confirmed financial inputs and keeps the equation visible.
- **Separates facts from judgment.** Business-quality adjustments are deterministic; AI is used only for current market research.
- **Makes evidence auditable.** Each market factor includes its finding, adjustment, evidence strength, description, and source URLs.
- **Prevents stale conclusions.** Any input change invalidates the previous research and locks the valuation until it is refreshed.

---

## How the valuation works

```text
Normalized SDE =
  net profit
  + owner salary
  + interest expense
  + depreciation and amortization
  + verified one-time add-backs

Final multiple =
  3.00× universal base
  + business-quality adjustment
  + AI market adjustment

Estimated business value =
  SDE × final multiple
  + inventory
  + FF&E
  + included real estate
  + excess / non-operating assets
  − debt assumed by the buyer
```

The deterministic business-quality adjustment considers revenue growth, recurring
revenue, owner dependence, largest-customer concentration, and remaining lease term.
The preliminary low and high values use a ±0.40× range around the final multiple.

## Research safeguards

| Market factor | Evidence considered | Maximum adjustment |
|---|---|---:|
| Industry transactions | Completed small-business sales and SDE/cash-flow multiples | Evidence-tier cap, up to ±0.80× |
| Local demand | Population, income, establishment, and demand growth | ±0.15× |
| Labor conditions | Employment, wages, availability, and hiring difficulty | ±0.15× |
| Competition | Local density, formations, closures, and competitive intensity | ±0.15× |

Industry transaction evidence is graded before it can affect the valuation:

| Evidence tier | Meaning | Server cap |
|---|---|---:|
| Exact | Multiple recent completed sales for the same business type and a comparable size | ±0.80× |
| Related | Completed sales from a related subindustry or with a meaningful size/market mismatch | ±0.40× |
| Broad | Completed-sale evidence for only a broad industry category | ±0.20× |
| Weak | Asking prices, unclear samples, stale evidence, or unsupported comparables | 0.00× |

The complete AI market adjustment is capped between −1.00× and +1.00×. A factor
without an approved supporting source is forced to 0.00×. Research is restricted to
the domains selected by the user; the default list includes Census, BEA, BLS,
CareerOneStop, SizeUp, BizBuySell, and IBBA.

## Why it is not a thin AI wrapper

The model does not calculate SDE, choose the business-quality adjustments, or supply
the final market-adjustment total. TypeScript handles the valuation deterministically,
while the server validates the AI's structured four-factor response, removes unapproved
URLs, grades transaction evidence, applies category caps, and calculates the final AI
adjustment itself. AI is a guarded research layer inside a reproducible valuation
system—not the valuation system.

---

## Tech

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript + custom responsive CSS |
| Valuation | Deterministic TypeScript SDE, multiple, range, and asset calculations |
| AI research | Server-side OpenAI Responses API with web search and structured JSON output |
| Source controls | User-approved domain allowlist, server URL validation, complete per-factor source lists |
| Persistence | Browser `localStorage`; no account or project database required |
| Hosting | Vercel with server-side environment variables |

## Running locally

Requirements: Node.js 22.13 or newer.

```bash
git clone https://github.com/matthewmorozov123/brokerlens.git
cd brokerlens
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The interface and deterministic valuation engine load
without an API key. Live market research requires these server-side variables:

```env
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5.6-sol
```

Never commit `.env`, `.env.local`, or a real API key.

## Validation

```bash
npm test
npm run lint
```

## Project structure

```text
app/
  BrokerLensApp.tsx        Four-step valuation workspace and local project UI
  api/research/route.ts    Approved-domain market research and server validation
  api/classify-industry/   Custom-industry matching endpoint
  globals.css              Responsive light and dark themes
lib/
  valuation.ts             SDE, quality adjustments, ranges, and asset math
public/
  og.png                   BrokerLens social and README cover image
tests/
  vercel-build.test.mjs    Production-output verification
```

## Important limitation

BrokerLens provides a preliminary broker opinion, not a certified appraisal. Financial
inputs, add-backs, asset values, assumed debt, tax treatment, and comparable sales must
be independently verified before marketing or purchasing a business. Licensed
transaction databases, document extraction, and historical backtesting are logical
next integrations.
