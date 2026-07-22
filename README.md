# BrokerLens

BrokerLens is a transparent business-valuation MVP for business brokers. It turns
confirmed operating inputs into a preliminary market-value range, suggested asking
price, likely sale range, and an auditable multiple-adjustment trail.

## MVP features

- Live SDE and industry-multiple valuation model
- Quality and risk adjustments with plain-English explanations
- Inventory, excess-asset, and assumed-debt adjustments
- Optional AI web research restricted to broker-approved domains
- Clickable research citations
- Browser-local saved projects (no account or database required)
- Responsive broker workstation and preloaded Phoenix HVAC demo

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The core valuation works without any secret. To enable live research:

1. Copy `.env.example` to `.env.local`.
2. Add your `OPENAI_API_KEY` to `.env.local`.
3. Restart the development server.

Never commit `.env.local` or a real API key. For deployment, add the same variable
through the host's environment-variable settings.

## Validate

```bash
npm test
npm run lint
```

## Important limitation

BrokerLens produces a preliminary broker opinion, not a certified appraisal. The
MVP requires the broker to confirm financial inputs and add-backs. Document extraction,
licensed transaction databases, and backtesting are logical next integrations.

