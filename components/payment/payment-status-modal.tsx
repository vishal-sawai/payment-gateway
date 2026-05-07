"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PaymentStatus, Transaction } from "@/types/payment";
import {
  formatMoney,
  isResultStatus,
  MAX_PAYMENT_ATTEMPTS,
} from "@/utils/payment";
import { MODAL_VIEW } from "@/types/constant";


interface PaymentStatusModalProps {
  canRetry: boolean;
  lastMessage: string;
  onReset: () => void;
  onRetry: () => void;
  status: PaymentStatus;
  transaction: Transaction | null;
}

export function PaymentStatusModal({
  canRetry,
  lastMessage,
  onReset,
  onRetry,
  status,
  transaction,
}: PaymentStatusModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = status !== "idle";
  const amountLabel = useMemo(() => {
    if (!transaction) {
      return null;
    }

    return formatMoney(transaction.amount, transaction.currency);
  }, [transaction]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen, status, transaction?.updatedAt]);

  if (!isOpen) {
    return null;
  }

  const view = MODAL_VIEW[status];
  const isFinalFailure =
    transaction &&
    (status === "failed" || status === "timeout") &&
    transaction.attempts >= MAX_PAYMENT_ATTEMPTS;
  const canShowRetry =
    (status === "failed" || status === "timeout") && !isFinalFailure;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm">
      <div
        aria-labelledby="payment-status-title"
        aria-modal="true"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl outline-none"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className={`flex h-16 w-16 items-center justify-center rounded-full ${view.accent}`}
          >
            {status === "processing" ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/35 border-t-white" />
            ) : (
              <span className="h-6 w-6 rounded-full bg-white" />
            )}
          </span>

          <h2
            className="mt-5 text-2xl font-semibold text-neutral-950"
            id="payment-status-title"
          >
            {view.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {view.description}
          </p>
        </div>

        {transaction ? (
          <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700">
            <div className="flex items-center justify-between gap-4">
              <span>Amount</span>
              <span className="font-semibold text-neutral-950">
                {amountLabel}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span>Card</span>
              <span className="font-semibold text-neutral-950">
                {transaction.cardType.toUpperCase()} ending{" "}
                {transaction.cardLast4}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span>Retry count</span>
              <span className="font-semibold text-neutral-950">
                {transaction.attempts} of {MAX_PAYMENT_ATTEMPTS}
              </span>
            </div>
            {isResultStatus(status) ? (
              <div className="mt-3 border-t border-neutral-200 pt-3">
                <span className="block text-neutral-500">Reference</span>
                <span className="mt-1 block break-all font-mono text-xs font-semibold text-neutral-950">
                  {transaction.id}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="mt-4 text-center text-sm leading-6 text-neutral-700">
          {lastMessage}
        </p>

        {isFinalFailure ? (
          <p className="mt-2 text-center text-sm font-medium text-rose-700">
            This payment cannot be retried again.
          </p>
        ) : null}

        <div className="mt-6 grid gap-3">
          {canShowRetry ? (
            <button
              className="h-11 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
              disabled={!canRetry}
              onClick={onRetry}
              type="button"
            >
              Retry payment
            </button>
          ) : null}

          {isResultStatus(status) ? (
            <button
              className="h-11 rounded-lg border border-neutral-300 px-4 text-sm font-semibold text-neutral-800 transition hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-neutral-200 cursor-pointer bg-yellow-400"
              onClick={onReset}
              type="button"
            >
              Make another payment
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
