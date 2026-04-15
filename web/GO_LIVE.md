# AI4Kids Go-Live Checklist

## Current Vercel state

- New Next.js project: `ai4kids-store-web`
- Legacy Vite project: `ai4kids-store-client`
- `ai4kids.in` and `www.ai4kids.in` are currently attached to the legacy `ai4kids-store-client` project
- Final cutover must move both custom domains to `ai4kids-store-web`

## Frontend go-live target

- Vercel project root: `web`
- Framework: `Next.js`
- Production domain: `ai4kids.in`
- Secondary domain: `www.ai4kids.in`
- Required env:
  - `NEXT_PUBLIC_API_URL=https://ai4kids-api.onrender.com/api`
  - `NEXT_PUBLIC_COD_CONFIRMATION_AMOUNT=40`
  - `NEXT_PUBLIC_COD_CONFIRMATION_FEE_PER_ITEM=40`

## Backend production settings

- Deploy the current `server` app to the API host
- Required production env:
  - `CLIENT_URL=https://ai4kids.in`
  - `MONGODB_URI=<production-mongodb-uri>`
  - `JWT_SECRET=<long-random-secret>`
  - `ADMIN_NAME=<admin display name>`
  - `ADMIN_EMAIL=<admin login email>`
  - `ADMIN_PASSWORD=<admin login password>`
  - `RAZORPAY_KEY_ID=<live-key-id>`
  - `RAZORPAY_KEY_SECRET=<live-key-secret>`
  - `RAZORPAY_CURRENCY=INR`
  - `ALLOW_MOCK_PAYMENTS=false`
  - `COD_CONFIRMATION_AMOUNT=40`
  - `COD_CONFIRMATION_FEE_PER_ITEM=40`

## Razorpay production checklist

1. Use live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. Keep `ALLOW_MOCK_PAYMENTS=false`
3. Confirm backend `CLIENT_URL=https://ai4kids.in`
4. Verify checkout creates orders from `/api/payments/create-order`
5. Verify success flow reaches `/api/payments/verify`
6. Verify dismissal/failure reaches `/api/payments/failure`
7. Run one real or low-value live payment after cutover

## Product visibility rules

- Products below `Rs 500` are hidden from:
  - homepage
  - products listing
  - search
  - category pages
  - related products
  - product detail pages
  - admin product list
- Admin create, update, and catalog import reject products below `Rs 500`

## Domain cutover steps for ai4kids.in

1. Open Vercel project `ai4kids-store-web`
2. Confirm latest production deployment is healthy
3. Set project root to `web` if not already configured
4. Add frontend production env vars to `ai4kids-store-web`
5. In legacy project `ai4kids-store-client`, remove:
   - `ai4kids.in`
   - `www.ai4kids.in`
6. In new project `ai4kids-store-web`, add:
   - `ai4kids.in`
   - `www.ai4kids.in`
7. Wait for Vercel domain verification and SSL provisioning to complete
8. Open both domains and confirm they now serve the Next app

## Smoke test after cutover

1. Open `/`
2. Open `/products`
3. Open `/cart`
4. Open `/checkout`
5. Open `/admin`
6. Sign in and open `/admin/dashboard`
7. Confirm low-price products do not appear
8. Upload a small catalog file and confirm import summary appears
9. Download CSV and Excel exports from admin orders
10. Run one Razorpay payment test
11. Confirm order success and payment failure pages work
12. Refresh `/admin/dashboard` and `/products/<slug>` directly to confirm no route 404s

## Final cutover note

- Live Vercel traffic must point to the Next app in `web`
- Do not keep the legacy `client` app as the active production frontend after the domain move
