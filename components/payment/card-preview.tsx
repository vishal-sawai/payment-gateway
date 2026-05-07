"use client";

import type { PaymentFormValues } from "@/types/payment";
import {
  CARD_TYPE_LABELS,
  detectCardType,
  formatCardNumber,
  getCardDigitLimit,
  onlyDigits,
} from "@/utils/card";
import { CARD_ACCENT_CLASSES, formatMoney } from "@/utils/payment";

interface CardPreviewProps {
  values: PaymentFormValues;
}

function getPreviewNumber(value: string): string {
  if (!onlyDigits(value)) {
    return "4242 4242 4242 4242";
  }

  const cardType = detectCardType(value);
  const limit = getCardDigitLimit(cardType);
  const paddedDigits = onlyDigits(value).padEnd(limit, "0");

  return formatCardNumber(paddedDigits);
}

export function CardPreview({ values }: CardPreviewProps) {
  const cardType = detectCardType(values.cardNumber);
  const cardLabel = CARD_TYPE_LABELS[cardType];
  const displayName = values.cardholderName.trim() || "CARDHOLDER NAME";
  const displayExpiry = values.expiry || "MM/YY";
  const amount = Number(values.amount);
  const displayAmount =
    Number.isFinite(amount) && amount > 0
      ? formatMoney(amount, values.currency)
      : `${values.currency} 0.00`;

  return (
    <section aria-label="Live card preview" className="space-y-3">
      <div
        className={`relative aspect-[1.586] overflow-hidden rounded-lg bg-linear-to-br ${CARD_ACCENT_CLASSES[cardType]} p-5 text-white shadow-xl`}
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-white/10" />
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/20" />
        <div className="absolute -bottom-12 left-8 h-40 w-40 rounded-full bg-black/10" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-white/75">
                Payment card
              </p>
              <p className="mt-1 text-lg font-semibold">{cardLabel}</p>
            </div>
            <div className="h-10 w-14 rounded-md border border-white/25 bg-white/25" />
          </div>

          <div>
            <p className="font-mono text-xl font-semibold md:text-2xl">
              {getPreviewNumber(values.cardNumber)}
            </p>
            <div className="mt-5 grid grid-cols-[1fr_auto] gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-white/65">Name</p>
                <p className="mt-1 truncate font-semibold uppercase">
                  {displayName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/65">Expiry</p>
                <p className="mt-1 font-semibold">{displayExpiry}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-neutral-600">
            Payment amount
          </span>
          <span className="text-lg font-semibold text-neutral-950">
            {displayAmount}
          </span>
        </div>
      </div>
    </section>
  );
}
