# Organik Food BD — Product Data Repair

This build keeps the existing website UI, Firebase project, routes and product schema.
The public product catalog now uses Cloud Firestore `products` as its source of truth instead of depending on `/api/products` or the empty `data/db.json` fallback.

## Deploy
- Keep the same Cloudflare Pages project and the same custom/Pages URL.
- Replace the project files with this ZIP and deploy/build normally.
- No Firebase product documents need to be recreated.

## Firebase
- Project: `organik-food-bd`
- Collection: `products`
- Product reads are public according to the included `firestore.rules`.
- The app performs an immediate Firestore read and then subscribes to realtime updates.
- Firestore long-polling is enabled for better compatibility on networks where the normal WebChannel connection fails.

## Important
Existing product documents are not modified or deleted by this repair.
