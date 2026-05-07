"use client";

import { useEffect, useMemo } from "react";
import { useFormik, type FormikHelpers } from "formik";
import type { Currency, PaymentFormValues } from "@/types/payment";
import { CURRENCIES } from "@/types/payment";
import { CardInput } from "@/components/payment/card-input";
import {
  detectCardType,
  formatExpiryDate,
  onlyDigits,
} from "@/utils/card";
import { normalizeAmountInput } from "@/utils/payment";
import {
  initialPaymentValues,
  paymentValidationSchema,
} from "@/validations/payment-validation";

interface PaymentFormProps {
  disabled: boolean;
  onValuesChange: (values: PaymentFormValues) => void;
  onSubmit: (values: PaymentFormValues) => void;
}

type FieldName = keyof PaymentFormValues;

function getVisibleError(
  values: PaymentFormValues,
  touched: Partial<Record<FieldName, boolean>>,
  errors: Partial<Record<FieldName, string>>,
  field: FieldName,
): string | undefined {
  const value = values[field];
  const error = errors[field];
  const hasInteracted = Boolean(touched[field]) || String(value).length > 0;

  return hasInteracted && error ? error : undefined;
}

function FieldError({ error, id }: { error?: string; id: string }) {
  if (!error) {
    return null;
  }

  return (
    <p className="text-sm text-rose-700" id={id}>
      {error}
    </p>
  );
}

export function PaymentForm({
  disabled,
  onSubmit,
  onValuesChange,
}: PaymentFormProps) {
  const formik = useFormik<PaymentFormValues>({
    initialValues: initialPaymentValues,
    validationSchema: paymentValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (
      values: PaymentFormValues,
      helpers: FormikHelpers<PaymentFormValues>,
    ) => {
      helpers.setSubmitting(false);
      onSubmit(values);
    },
  });

  const cardType = useMemo(
    () => detectCardType(formik.values.cardNumber),
    [formik.values.cardNumber],
  );
  const cvvLimit = cardType === "amex" ? 4 : 3;

  useEffect(() => {
    onValuesChange(formik.values);
  }, [formik.values, onValuesChange]);

  const cardNumberError = getVisibleError(
    formik.values,
    formik.touched,
    formik.errors,
    "cardNumber",
  );
  const nameError = getVisibleError(
    formik.values,
    formik.touched,
    formik.errors,
    "cardholderName",
  );
  const expiryError = getVisibleError(
    formik.values,
    formik.touched,
    formik.errors,
    "expiry",
  );
  const cvvError = getVisibleError(
    formik.values,
    formik.touched,
    formik.errors,
    "cvv",
  );
  const amountError = getVisibleError(
    formik.values,
    formik.touched,
    formik.errors,
    "amount",
  );

  const isSubmitDisabled =
    disabled || formik.isSubmitting || !formik.isValid || !formik.dirty;

  return (
    <form
      className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm md:p-6"
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <div className="mb-6">
        <p className="text-sm font-semibold text-emerald-700">
          Secure checkout
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-950 md:text-3xl">
          Complete your payment
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
          Enter your card details and confirm the payment securely.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-900"
            htmlFor="cardholderName"
          >
            Cardholder name
          </label>
          <input
            aria-describedby={nameError ? "cardholderName-error" : undefined}
            aria-invalid={Boolean(nameError)}
            autoComplete="cc-name"
            className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
            disabled={disabled}
            id="cardholderName"
            name="cardholderName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Alex Morgan"
            type="text"
            value={formik.values.cardholderName}
          />
          <FieldError error={nameError} id="cardholderName-error" />
        </div>

        <CardInput
          cardType={cardType}
          disabled={disabled}
          error={cardNumberError}
          id="cardNumber"
          name="cardNumber"
          onBlur={formik.handleBlur}
          onChange={(value) => {
            void formik.setFieldValue("cardNumber", value, true);
          }}
          value={formik.values.cardNumber}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-900"
              htmlFor="expiry"
            >
              Expiry date
            </label>
            <input
              aria-describedby={expiryError ? "expiry-error" : undefined}
              aria-invalid={Boolean(expiryError)}
              autoComplete="cc-exp"
              className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
              disabled={disabled}
              id="expiry"
              inputMode="numeric"
              name="expiry"
              onBlur={formik.handleBlur}
              onChange={(event) => {
                void formik.setFieldValue(
                  "expiry",
                  formatExpiryDate(event.target.value),
                  true,
                );
              }}
              placeholder="MM/YY"
              value={formik.values.expiry}
            />
            <FieldError error={expiryError} id="expiry-error" />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-900"
              htmlFor="cvv"
            >
              CVV
            </label>
            <input
              aria-describedby={cvvError ? "cvv-error" : undefined}
              aria-invalid={Boolean(cvvError)}
              autoComplete="cc-csc"
              className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
              disabled={disabled}
              id="cvv"
              inputMode="numeric"
              name="cvv"
              onBlur={formik.handleBlur}
              onChange={(event) => {
                void formik.setFieldValue(
                  "cvv",
                  onlyDigits(event.target.value).slice(0, cvvLimit),
                  true,
                );
              }}
              placeholder={cardType === "amex" ? "1234" : "123"}
              value={formik.values.cvv}
            />
            <FieldError error={cvvError} id="cvv-error" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_132px]">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-900"
              htmlFor="amount"
            >
              Amount
            </label>
            <input
              aria-describedby={amountError ? "amount-error" : undefined}
              aria-invalid={Boolean(amountError)}
              className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
              disabled={disabled}
              id="amount"
              inputMode="decimal"
              name="amount"
              onBlur={formik.handleBlur}
              onChange={(event) => {
                void formik.setFieldValue(
                  "amount",
                  normalizeAmountInput(event.target.value),
                  true,
                );
              }}
              placeholder="2499.00"
              value={formik.values.amount}
            />
            <FieldError error={amountError} id="amount-error" />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-900"
              htmlFor="currency"
            >
              Currency
            </label>
            <select
              className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
              disabled={disabled}
              id="currency"
              name="currency"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.currency}
            >
              {CURRENCIES.map((currency: Currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-base font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 cursor-pointer"
        disabled={isSubmitDisabled}
        type="submit"
      >
        {disabled ? "Processing payment" : "Pay securely"}
      </button>
    </form>
  );
}
