# Akro Sports store

Full-stack football jersey store: Node + Express + SQLite backend, vanilla JS + GSAP front end.

## Run (Windows or any OS)
```
npm install
copy .env.example .env      (macOS/Linux: cp .env.example .env)
npm start
```
Open http://localhost:3000. Orders page: http://localhost:3000/admin.html (uses ADMIN_KEY from `.env`).

## Set these in `.env` before going live
- `WHATSAPP_NUMBER` – country code + number, digits only, e.g. `919876543210`
- `ADMIN_KEY` – a long private password for the orders page
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` – optional; the online-payment option appears only when both are set. Use test keys first.
- Shipping, COD and name/number print fees: `FREE_SHIPPING_OVER`, `SHIPPING_FEE`, `COD_FEE`, `CUSTOM_PRINT_FEE`

## Swap in real products
Edit `data/products.js` (name, price, sizes, description). To use a real photo, add `image: '/assets/products/xyz.jpg'`
(put the file in `public/assets/products/`). Then run `npm run reseed`. Existing orders are kept.
Note: the storefront currently draws the original SVG jerseys; photo support for `image` needs a small change in `public/js/app.js` (`svg()` helper).

## Before launch
- Replace the sample reviews in `public/js/app.js` (`REVIEWS`) with real ones, then set `SAMPLE_REVIEWS = false`.
- Add real policies (shipping, returns, size guide); the footer links currently scroll to the contact section.
- Deploy on any Node host (Render, Railway, a VPS). Keep `data/akro.db` on a persistent disk.

## Layout
- `server.js` API, pricing, Razorpay, WhatsApp link, admin
- `db.js`, `data/products.js` database and seed catalogue
- `public/index.html`, `css/style.css`, `js/app.js` storefront; `js/jersey.js` SVG jersey generator
