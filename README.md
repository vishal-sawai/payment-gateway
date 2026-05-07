# Payment Gateway

A payment gateway flow built with Next.js App Router, React, TypeScript, Formik, Yup, Axios, Tailwind CSS, and Zustand.

The app lets a user enter card details, submit a simulated payment, see processing/result feedback, retry failed or timed-out payments, and review persisted transaction history.

## Tech Stack

- Next.js `16.2.5` with the App Router.
- React `19.2.4` and TypeScript.
- Tailwind CSS `4.2.4` through `@tailwindcss/postcss`.
- Formik for form state.
- Yup for payment validation.
- Axios for the frontend API request.
- Zustand with persisted localStorage history.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Build for production:

```bash
npm run build
npm run start
```

Run linting:

```bash
npm run lint
```

## Available Scripts

- `npm run dev` starts the Next.js development server.
- `npm run build` creates a production build.
- `npm run start` starts the production server after a build.

## Application Routes

- `/` displays the checkout flow.
- `/transactions` displays persisted payment history and status totals.
- `/transactions/[id]` displays a receipt-style detail view for one transaction.
- `/api/pay` handles the mock gateway `POST` request.

## Payment Flow

1. The checkout page renders `Payment`, which combines the form, live card preview, and payment status modal.
2. `PaymentForm` manages user input with Formik and validates fields with Yup on change and blur.
3. On submit, `usePaymentProcessor` creates a transaction ID and converts form values into a `PaymentPayload`.
4. The Zustand store records the transaction as `processing` and persists sanitized history to localStorage.
5. The frontend posts to `/api/pay` with Axios and an `AbortController` timeout.
6. The API route randomly returns success, failure, or a delayed timeout response.
7. The store updates the transaction with the final status, message, reason, and approval code when present.
8. Failed and timed-out active payments can be retried up to 3 attempts with the same transaction ID.

## Mock Gateway Behavior

The `POST /api/pay` route validates the incoming payload and then simulates gateway outcomes:

- About 60% of requests return `success`.
- About 25% return `failed` with a randomized decline reason.
- About 15% wait for 8 seconds and return `timeout`.

The frontend timeout is 6 seconds, so the delayed branch is treated as a client-side timeout before the API response arrives.

## Validation Rules

The form validates:

- Cardholder name is required, at least 2 characters, and limited to common name characters.
- Card number must be Visa, Mastercard, or Amex.
- Card number must match the expected length for the detected card type.
- Card number must pass the Luhn check.
- Expiry must use `MM/YY` and cannot be in the past.
- CVV must be 3 digits for Visa/Mastercard and 4 digits for Amex.
- Amount must be greater than 0 with up to 2 decimal places.
- Currency must be either `INR` or `USD`.

## State And Persistence

`stores/payment-store.ts` owns the payment lifecycle:

- Current status: `idle`, `processing`, `success`, `failed`, or `timeout`.
- Current and selected transaction IDs.
- Last user-facing payment message.
- Transaction history.

Only transaction history is persisted under the localStorage key `payment-gateway-history`. Full card numbers and CVV values are not stored in history; only card type and last 4 digits are retained.

## Project Structure

```text
app/
  api/pay/route.ts              Mock payment gateway route
  page.tsx                      Checkout page
  transactions/page.tsx         Transaction history page
  transactions/[id]/page.tsx    Transaction detail page
  layout.tsx                    Root layout and metadata
  globals.css                   Tailwind/global styles

components/payment/
  payment.tsx                   Main checkout composition
  payment-form.tsx              Formik/Yup payment form
  card-input.tsx                Card number input and detected type badge
  card-preview.tsx              Live card and amount preview
  payment-status-modal.tsx      Processing/result modal with retry action
  transaction-history.tsx       Persisted history table and totals
  transaction-details.tsx       Receipt/detail view

hooks/
  usePaymentProcessor.ts        Submit, timeout, retry, and reset orchestration

stores/
  payment-store.ts              Zustand payment lifecycle and persisted history

types/
  payment.ts                    Payment, gateway, and transaction types
  constant.ts                   Modal copy and failure reasons
  comman-type.ts                Shared utility types

utils/
  card.ts                       Card formatting, detection, masking, Luhn, expiry
  error.ts                      Payment request error handling
  helper.ts                     Runtime payload guards and failure selection
  payment.ts                    Payment constants and formatting helpers
  payment-api.ts                Axios gateway client and response guard

validations/
  payment-validation.ts         Yup schema and initial form values
```