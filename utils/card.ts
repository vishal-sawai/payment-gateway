import type { CardType } from "@/types/payment";

// Card number lengths based on card type
const CARD_LENGTHS: Record<Exclude<CardType, "unknown">, number> = {
  visa: 16,
  mastercard: 16,
  amex: 15,
};

// card label
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  unknown: "Card",
};

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// Detect card type based on number patterns
export function detectCardType(value: string): CardType {
  const digits = onlyDigits(value);

  if (/^4/.test(digits)) {
    return "visa";
  }

  if (/^(34|37)/.test(digits)) {
    return "amex";
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));

  if (
    (firstTwo >= 51 && firstTwo <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "mastercard";
  }

  return "unknown";
}

// Get the expected digit limit for a card type
export function getCardDigitLimit(cardType: CardType): number {
  if (cardType === "unknown") {
    return 16;
  }

  return CARD_LENGTHS[cardType];
}

export function formatCardNumber(value: string): string {
  const cardType = detectCardType(value);
  const digits = onlyDigits(value).slice(0, getCardDigitLimit(cardType));

  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiryDate(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function maskCardNumber(value: string): string {
  const digits = onlyDigits(value);
  const visible = digits.slice(-4).padStart(4, "0");

  return `**** **** **** ${visible}`;
}

export function getCardLast4(value: string): string {
  return onlyDigits(value).slice(-4);
}

export function isValidLuhn(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length < 12) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isExpiryInFuture(value: string): boolean {
  const [monthValue, yearValue] = value.split("/");
  const month = Number(monthValue);
  const year = Number(yearValue);

  if (!monthValue || !yearValue || month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}
