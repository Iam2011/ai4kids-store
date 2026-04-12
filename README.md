# AI4Kids Toy Store

Production-ready e-commerce starter for a toy brand using React, Express, MongoDB, Razorpay, and WhatsApp notifications. The UX is optimized for mobile ad traffic with urgency messaging, simple discovery paths, and a friction-reduced checkout.

## Folder Structure

```text
New project/
├── client/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── data/
│   │   └── SUPERKIDS_FINAL_CLEAN.csv
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Key Features

- Conversion-focused landing page with hero, urgency blocks, featured discounts, age buckets, and category buckets
- Product listing with category, age, sort, and search filters
- Product detail page with gallery, MOQ, discount framing, trust markers, and sticky mobile buy bar
- Cart with quantity controls, coupon application, and dynamic totals
- Checkout with pincode-based city/state autofill
- Two payment flows:
  - `full_payment`
  - `cod_deposit` with Rs 40 confirmation payment
- Razorpay order creation and signature verification
- Order persistence in MongoDB
- WhatsApp order notification hook after successful payment
- Admin login, product management, order dashboard, and summary metrics
- CSV-backed seed flow using your provided catalog

## Database Schema

### `Product`

- `sku`, `name`, `slug`
- `price`, `originalPrice`, `discountPercent`
- `imageUrl`, `gallery`, `videoUrl`
- `description`, `shortDescription`
- `category`, `subCategory`, `ageGroup`
- `moq`, `stockCount`, `limitedStock`, `badge`, `featured`
- `tags`, `isActive`

### `Order`

- `orderNumber`
- `customer.name`, `customer.mobile`, `customer.address`, `customer.pincode`, `customer.city`, `customer.state`
- `items[]` snapshot with product, quantity, price, MOQ, and line total
- `subtotal`, `discountAmount`, `couponCode`, `totalAmount`
- `paymentMode`, `paymentAmount`, `depositAmount`, `balanceDue`
- `paymentStatus`, `orderStatus`
- `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
- `paymentGateway`, `source`, `whatsappStatus`, `notes`

### `Coupon`

- `code`, `description`
- `type`, `value`
- `minOrderAmount`, `maxDiscount`
- `allowOnCod`, `allowOnFull`, `active`, `expiresAt`

### `Admin`

- `name`, `email`, `passwordHash`
- `role`, `active`

## API Routes

### Public

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/coupons/validate`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/failure`
- `GET /api/location/pincode/:pincode`
- `GET /api/orders/:orderNumber`

### Admin

- `POST /api/admin/login`
- `GET /api/admin/summary`
- `GET /api/admin/orders`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`

Admin routes require `Authorization: Bearer <token>`.

## Environment Variables

### `server/.env`

Copy `server/.env.example` to `server/.env` and set:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai4kids
JWT_SECRET=replace-with-a-long-random-string
ADMIN_NAME=AI4Kids Admin
ADMIN_EMAIL=admin@ai4kids.in
ADMIN_PASSWORD=ChangeMe123!
CATALOG_CSV_PATH=./data/SUPERKIDS_FINAL_CLEAN.csv
COD_CONFIRMATION_AMOUNT=40
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx
RAZORPAY_CURRENCY=INR
ALLOW_MOCK_PAYMENTS=true
PINCODE_API_URL=https://api.postalpincode.in/pincode
WHATSAPP_API_BASE_URL=https://graph.facebook.com/v20.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_NOTIFY_TO=91XXXXXXXXXX
```

### `client/.env`

Copy `client/.env.example` to `client/.env` if you want an explicit API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step-by-Step Run Guide

1. Install MongoDB locally or use MongoDB Atlas.
2. Create `server/.env` from `server/.env.example`.
3. Optional: create `client/.env` from `client/.env.example`.
4. Install dependencies from the project root:

```bash
npm install
```

5. Seed the catalog and default coupons/admin:

```bash
npm run seed
```

6. Start both frontend and backend:

```bash
npm run dev
```

7. Open `http://localhost:5173`.

## Admin Access

The backend auto-creates the default admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when the server starts or when the seed script runs.

## Razorpay Notes

- If valid Razorpay keys are set, checkout uses real Razorpay orders and signature verification.
- If keys are missing and `ALLOW_MOCK_PAYMENTS=true`, the app falls back to a mock success path so you can demo the entire checkout flow locally.

## WhatsApp Notes

- The included implementation targets the Meta WhatsApp Cloud API text-message endpoint.
- Add the Graph API base URL, phone number ID, token, and destination number in the server env file.
- If those values are missing, the app safely marks WhatsApp notifications as skipped instead of breaking checkout.

## Data Seeding Behavior

- Products are imported from `server/data/SUPERKIDS_FINAL_CLEAN.csv`
- The seed script derives category, sub-category, age group, discount, urgency badge, MOQ, and stock data from the product name and price
- Products are upserted by slug so repeated seeding updates the catalog instead of duplicating it

## Deployment Readiness

- Frontend builds with Vite production output
- Backend is separated into controllers, models, services, and routes
- Env-driven integration points are isolated
- Admin auth uses JWT
- Client and server are organized for split deployment if needed

## Verified In This Workspace

- `npm install`
- `npm run build --workspace client`
- Syntax check across all server `.js` files using `node --check`

## Not Verified Here

- Live MongoDB connectivity, because MongoDB is not installed in this workspace
- Live Razorpay transactions, because checkout keys were not provided
- Live WhatsApp API delivery, because API credentials were not provided
