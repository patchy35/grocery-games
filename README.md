# 🛒 Grocery Games

Find the best grocery deals from local store circulars near you.

## What it does
- Enter your grocery list items one by one
- Enter your zip code
- Hit **Find Best Deals** — it scans real weekly circulars from Giant Food, Aldi, Martin's, Walmart, CVS, and 70+ local stores via the Flipp API
- Results are sorted cheapest first with store name, sale dates, and savings

## Stack
- **Frontend:** React (Base44 mini app)
- **Backend:** Deno edge function
- **Data source:** Flipp circular aggregator API (no key required)

## Files
- `pages/Home.jsx` — React frontend
- `functions/searchGroceryDeals.ts` — Backend function that queries Flipp by zip code and item

## Live App
https://untitled-app-f5881d6d.base44.app
