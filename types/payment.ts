export const CURRENCIES = ["INR", "USD"] as const;

export type Currency = (typeof CURRENCIES)[number];

export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

export type TransactionStatus = Exclude<PaymentStatus, "idle">;

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
  cardType: CardType;
}

export interface GatewayResponse {
  status: Extract<PaymentStatus, "success" | "failed" | "timeout">;
  transactionId: string;
  message: string;
  reason?: string;
  approvalCode?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  attempts: number;
  cardholderName: string;
  cardType: CardType;
  cardLast4: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  reason?: string;
  approvalCode?: string;
}
