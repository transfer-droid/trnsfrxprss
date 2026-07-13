TRANSFER EXPRESS — STATIC WEBSITE
=================================

Files:
- index.html — main page
- rules.html — adapted service rules
- styles.css — all styles and responsive layouts
- script.js — asset selectors, online rates/chart, Telegram templates and local comments
- assets/logo-mark.svg and assets/favicon.svg
- assets/icons/*.svg — local vector icons for currencies, crypto assets and payment systems
- assets/monitoring/*.png — local PNG logos used in the monitoring section

Implemented:
- Static HTML/CSS/JS project with no registration and no backend
- Responsive desktop, tablet and mobile layouts
- Dark and light themes
- 46 exchange assets across crypto, bank cards/transfers, payment systems, vouchers and cash
- UAH directions are intentionally excluded
- Compact searchable asset selector with category filters and local SVG icons
- Dynamic requisites field based on the selected destination
- Public rate API chain with caching of the last successful result
- Interactive online chart with independently selectable base/quote assets, 7/30/90-day periods and exact hover/touch values
- Chart data from public Frankfurter/ECB, Binance Market Data and CoinGecko endpoints
- Telegram request link with a message generated from the selected pair, amount, result, requisites and comment
- Required 18+ / rules consent: the Telegram order button stays disabled until accepted
- “Ask a question” links with the template:
  “Здравствуйте, меня интересует следующий вопрос:”
- Guarantees and independent-check sections
- Separate rules page adapted to Transfer Express and its no-account workflow
- Review form with independently selectable direction, exact 1–5 star rating and required name
- Eight editable starter reviews are shown without technical labels; visitor comments are stored locally in that browser

Launch:
Open index.html directly, or upload the complete transfer-express folder to any static host such as Cloudflare Pages, GitHub Pages, Netlify, Vercel or ordinary web hosting.

Main configuration:
Open script.js and edit the CONFIG object near the top:
- telegramUsername
- refreshIntervalMs
- cachedRateMaxAgeMs
- serviceRateDivisor (default 1.01; displayed Transfer Express rate = market rate / divisor)

Notes:
- The displayed Transfer Express amount and chart are calculated from market API data using the configured service-rate divisor and remain indicative.
- Final rate, commission, direction availability, AML/KYC requirements and settlement details are confirmed by the operator in Telegram.
- Never request or collect card PINs, CVV/CVC, passwords or one-time confirmation codes.
