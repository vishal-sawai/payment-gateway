import type {
  CardType,
  Currency,
  PaymentFormValues,
  PaymentPayload,
  PaymentStatus,
} from "@/types/payment";
import { detectCardType, getCardLast4, onlyDigits } from "@/utils/card";

export const MAX_PAYMENT_ATTEMPTS = 3;
export const PROCESSING_DELAY_MS = 2000;
export const FRONTEND_TIMEOUT_MS = 6000;

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  idle: "Idle",
  processing: "Processing",
  success: "Success",
  failed: "Failed",
  timeout: "Timeout",
};

export const CARD_ACCENT_CLASSES: Record<CardType, string> = {
  visa: "from-emerald-700 via-teal-700 to-cyan-800",
  mastercard: "from-zinc-900 via-neutral-800 to-amber-700",
  amex: "from-cyan-700 via-sky-700 to-indigo-800",
  unknown: "from-neutral-900 via-zinc-800 to-emerald-800",
};

export function toPaymentPayload(
  values: PaymentFormValues,
  transactionId: string,
): PaymentPayload {
  return {
    transactionId,
    cardholderName: values.cardholderName.trim(),
    cardNumber: onlyDigits(values.cardNumber),
    expiry: values.expiry,
    cvv: onlyDigits(values.cvv),
    amount: Number(values.amount),
    currency: values.currency,
    cardType: detectCardType(values.cardNumber),
  };
}

export function summarizeCardLast4(values: PaymentFormValues): string {
  return getCardLast4(values.cardNumber);
}

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function isResultStatus(status: PaymentStatus): boolean {
  return status === "success" || status === "failed" || status === "timeout";
}

export function normalizeAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", decimals = ""] = cleaned.split(".");
  const hasDecimal = cleaned.includes(".");

  if (!hasDecimal) {
    return whole;
  }

  return `${whole}.${decimals.slice(0, 2)}`;
}
