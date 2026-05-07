import type { CardType, Currency, PaymentPayload } from "@/types/payment";
import { CURRENCIES } from "@/types/payment";
import { FAILURE_REASONS } from "@/types/constant";

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isCurrency(value: unknown): value is Currency {
    return typeof value === "string" && CURRENCIES.includes(value as Currency);
}

function isCardType(value: unknown): value is Exclude<CardType, "unknown"> {
    return value === "visa" || value === "mastercard" || value === "amex";
}
export function isPaymentPayload(value: unknown): value is PaymentPayload {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.transactionId === "string" &&
        value.transactionId.length > 0 &&
        typeof value.cardholderName === "string" &&
        typeof value.cardNumber === "string" &&
        typeof value.expiry === "string" &&
        typeof value.cvv === "string" &&
        typeof value.amount === "number" &&
        Number.isFinite(value.amount) &&
        value.amount > 0 &&
        isCurrency(value.currency) &&
        isCardType(value.cardType)
    );
}

export function getFailureReason(): string {
    const index = Math.floor(Math.random() * FAILURE_REASONS.length);

    return FAILURE_REASONS[index];
}