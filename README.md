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
- No third-party payment SDKs are used.

## Getting Started

Prerequisites:

- Node.js compatible with the installed Next.js version.
- npm.

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
- `npm run lint` runs ESLint.

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

## Assignment Coverage

- Payment form collects cardholder name, card number, expiry, CVV, amount, and currency.
- Validation runs in real time and the submit button stays disabled until the form is empty and valid.
- Card number input formats digits in groups of 4, detects Visa, Mastercard, and Amex, and shows a type badge.
- Live card preview updates while the user types.
- Payment lifecycle supports `idle`, `processing`, `success`, `failed`, and `timeout`.
- The mock gateway is implemented with a Next.js Route Handler at `/api/pay`.
- The frontend cancels slow gateway requests after 6 seconds with `AbortController`.
- Failed and timed-out payments can be retried up to 3 total attempts.
- Retries reuse the original frontend-generated `crypto.randomUUID()` transaction ID.
- Transaction history persists across refreshes using localStorage and each row links to a detail page.
- Shared payment state and history live in Zustand.
- Payment types are defined in TypeScript, including `PaymentPayload`, `Transaction`, `PaymentStatus`, and `CardType`.
- User-facing error messages are friendly and network/timeout errors are handled separately from API-declined payments.
- The layout is responsive for mobile and desktop widths.

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

## Assumptions

- The gateway is intentionally simulated; no real card authorization or payment provider integration is performed.
- The delayed gateway branch returns after 8 seconds, while the frontend treats it as a timeout after 6 seconds.
- Retry limits are counted per transaction, with the original transaction ID reused for all attempts.
- Transaction history stores sanitized card metadata only, not full card numbers or CVV.
- Currency support is limited to INR and USD because the assignment asks for at least those two currencies.

## Improvements With More Time

- Add otp based verification 
- Store data in database instead of storing in localstorage 
- Add filters/search/export actions for transaction history if the history grows large.

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
