import * as Yup from "yup";
import { CURRENCIES, type PaymentFormValues } from "@/types/payment";
import {
  detectCardType,
  getCardDigitLimit,
  isExpiryInFuture,
  isValidLuhn,
  onlyDigits,
} from "@/utils/card";

export const initialPaymentValues: PaymentFormValues = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

function hasValidAmount(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return false;
  }

  const amount = Number(normalized);

  return Number.isFinite(amount) && amount > 0;
}

function hasExpectedCardLength(value: string | undefined): boolean {
  const cardType = detectCardType(value ?? "");

  if (cardType === "unknown") {
    return false;
  }

  return onlyDigits(value ?? "").length === getCardDigitLimit(cardType);
}

function hasValidCvvForCard(
  this: Yup.TestContext,
  value: string | undefined,
): boolean {
  const parent = this.parent as PaymentFormValues;
  const cardType = detectCardType(parent.cardNumber);
  const expectedLength = cardType === "amex" ? 4 : 3;

  return new RegExp(`^\\d{${expectedLength}}$`).test(value ?? "");
}

export const paymentValidationSchema: Yup.ObjectSchema<PaymentFormValues> =
  Yup.object({
    cardholderName: Yup.string()
      .trim()
      .min(2, "Enter the cardholder name")
      .matches(
        /^[a-zA-Z .'-]+$/,
        "Use only letters, spaces, apostrophes, periods, or hyphens",
      )
      .required("Cardholder name is required"),
    cardNumber: Yup.string()
      .required("Card number is required")
      .test(
        "supported-card",
        "Use a Visa, Mastercard, or Amex card number",
        (value) => detectCardType(value ?? "") !== "unknown",
      )
      .test(
        "card-length",
        "Enter the complete card number",
        hasExpectedCardLength,
      )
      .test("luhn", "Enter a valid card number", (value) =>
        isValidLuhn(value ?? ""),
      ),
    expiry: Yup.string()
      .required("Expiry date is required")
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format")
      .test("future-expiry", "Card expiry cannot be in the past", (value) =>
        isExpiryInFuture(value ?? ""),
      ),
    cvv: Yup.string()
      .required("CVV is required")
      .test("cvv-card-type", "CVV must match the card type", hasValidCvvForCard),
    amount: Yup.string()
      .required("Amount is required")
      .test("valid-amount", "Enter a valid amount greater than 0", hasValidAmount),
    currency: Yup.mixed<PaymentFormValues["currency"]>()
      .oneOf([...CURRENCIES], "Choose a supported currency")
      .required("Currency is required"),
  });
