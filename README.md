# ScreenScout

ScreenScout is a polished, UK-focused TV comparison MVP. It is currently a dependency-free static frontend so it can be previewed immediately and deployed to any static host.

## Included in this MVP

- Search by brand, model, technology, retailer and features
- Price, size, brand, panel, retailer and feature filters
- Active filter tags, clear-all, sorting and grid/list views
- Realistic UK sample data with GBP prices, retailer, stock, delivery and freshness copy
- Save/watchlist state using browser local storage
- Compare up to four TVs with highlighted lowest price and highest rating
- Product detail modal with specs, retailer data disclaimer and actions
- Responsive mobile layout and accessible labels/focusable controls
- Sign-in placeholder with explicit production authentication guidance
- Local account creation/sign-in state stored in the browser
- Local target-price alerts stored per product
- Functional retailer search links for Currys, John Lewis, Amazon UK and AO

## Run locally

Open `index.html` directly, or serve the folder with any static server:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Architecture and next step

The current frontend deliberately keeps the mock catalogue in `app.js`. For production, move the `products` collection into a PostgreSQL-backed API (Next.js route handlers, REST or GraphQL) and preserve the product shape used by the UI. A sensible production stack is Next.js + TypeScript + Tailwind + Prisma + PostgreSQL, deployed on Vercel/Render/Railway.

Retailer connectors should implement a shared adapter interface such as `search()`, `getProduct()`, and `getPrices()`. Prefer official APIs, affiliate feeds, structured feeds or manually managed imports. Do not scrape in ways that breach retailer terms. Every price record should retain `sourceRetailer`, `sourceUrl`, `checkedAt`, `currency`, `stockStatus`, `delivery`, `verified` and `lastVerifiedAt`.

## Production data model

Recommended tables: `users`, `roles`, `brands`, `retailers`, `products`, `product_specs`, `product_images`, `features`, `product_features`, `product_prices`, `availability`, `saved_products`, `comparisons`, `comparison_items`, `price_alerts`, `search_history`, `retailer_integrations`, and `import_jobs`.

## Environment variables for the production API

`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `AMAZON_FEED_KEY`, `CURRYS_API_KEY`, `ARGOS_API_KEY`, `AFFILIATE_ID`, `EMAIL_PROVIDER_API_KEY`, and `ADMIN_EMAILS`.

Never commit secrets. Add `.env*` to `.gitignore` before connecting live services.

## Known limitations

The UI now supports local accounts, local target-price alerts and retailer search links. The catalogue still uses sample data because live prices and stock require approved retailer APIs, affiliate feeds or permitted imports; the retailer URLs currently open search pages rather than affiliate product links. Local accounts are browser-only and are not suitable for production authentication. The next production step is to replace the local storage adapter with a PostgreSQL API and a managed identity provider, then add compliant feed adapters and an email/notification worker.
