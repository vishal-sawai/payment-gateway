"use client";

import type { FocusEvent } from "react";
import type { CardType } from "@/types/payment";
import { CARD_TYPE_LABELS, formatCardNumber } from "@/utils/card";

interface CardInputProps {
  cardType: CardType;
  disabled: boolean;
  error?: string;
  id: string;
  name: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (value: string) => void;
  value: string;
}

export function CardInput({
  cardType,
  disabled,
  error,
  id,
  name,
  onBlur,
  onChange,
  value,
}: CardInputProps) {
  const errorId = `${id}-error`;
  const cardLabel = CARD_TYPE_LABELS[cardType];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-neutral-900" htmlFor={id}>
          Card number
        </label>
        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold uppercase text-neutral-700">
          {cardLabel}
        </span>
      </div>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="cc-number"
        className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
        disabled={disabled}
        id={id}
        inputMode="numeric"
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(formatCardNumber(event.target.value))}
        placeholder="4242 4242 4242 4242"
        value={value}
      />
      {error ? (
        <p className="text-sm text-rose-700" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
