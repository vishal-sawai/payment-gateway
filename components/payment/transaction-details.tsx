"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePaymentStore } from "@/stores/payment-store";
import { CARD_TYPE_LABELS } from "@/utils/card";
import {
  formatMoney,
  MAX_PAYMENT_ATTEMPTS,
  STATUS_LABELS,
} from "@/utils/payment";
import type { Transaction, TransactionStatus } from "@/types/payment";

const STATUS_PANEL_CLASSES: Record<TransactionStatus, string> = {
  processing: "border-cyan-200 bg-cyan-50 text-cyan-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  failed: "border-rose-200 bg-rose-50 text-rose-950",
  timeout: "border-amber-200 bg-amber-50 text-amber-950",
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusMessage(transaction: Transaction): string {
  if (transaction.status === "success") {
    return "This payment was approved and completed successfully.";
  }

  if (transaction.status === "failed") {
    return "This payment was declined. No successful charge was completed.";
  }

  if (transaction.status === "timeout") {
    return "This payment timed out before a confirmation was received.";
  }

  return "This payment is still being processed.";
}

export function TransactionDetails({
  transactionId,
}: {
  transactionId: string;
}) {
  const history = usePaymentStore((state) => state.history);
  const transaction = useMemo(
    () => history.find((item) => item.id === transactionId) ?? null,
    [history, transactionId],
  );

  if (!transaction) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-950">
          Payment not found
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          This payment is not available in your current history.
        </p>
        <Link
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-neutral-200"
          href="/transactions"
        >
          Back to payment history
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section
        className={`rounded-lg border p-5 shadow-sm ${STATUS_PANEL_CLASSES[transaction.status]}`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold">Payment receipt</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {STATUS_LABELS[transaction.status]}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6">
              {getStatusMessage(transaction)}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 px-4 py-3 text-right shadow-sm">
            <p className="text-sm font-medium opacity-75">Amount</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatMoney(transaction.amount, transaction.currency)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm lg:row-span-3">
        <h3 className="text-base font-semibold text-neutral-950">
          Payment method
        </h3>
        <div className="mt-4 rounded-lg bg-linear-to-br from-neutral-950 via-neutral-800 to-emerald-800 p-5 text-white">
          <p className="text-xs font-medium uppercase text-white/65">
            {CARD_TYPE_LABELS[transaction.cardType]}
          </p>
          <p className="mt-8 font-mono text-xl font-semibold">
            **** **** **** {transaction.cardLast4}
          </p>
          <p className="mt-5 text-sm font-semibold uppercase">
            {transaction.cardholderName}
          </p>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <DetailRow label="Card type" value={CARD_TYPE_LABELS[transaction.cardType]} />
          <DetailRow label="Attempts" value={`${transaction.attempts} of ${MAX_PAYMENT_ATTEMPTS}`} />
          <DetailRow label="Created" value={formatTimestamp(transaction.createdAt)} />
          <DetailRow label="Updated" value={formatTimestamp(transaction.updatedAt)} />
        </dl>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-950">
          Transaction details
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <DetailBlock label="Transaction ID" value={transaction.id} mono />
          <DetailBlock label="Status" value={STATUS_LABELS[transaction.status]} />
          <DetailBlock
            label="Amount"
            value={formatMoney(transaction.amount, transaction.currency)}
          />
          <DetailBlock label="Currency" value={transaction.currency} />
          {transaction.approvalCode ? (
            <DetailBlock label="Approval code" value={transaction.approvalCode} />
          ) : null}
          {transaction.reason ? (
            <DetailBlock label="Gateway message" value={transaction.reason} />
          ) : null}
        </dl>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-950">Timeline</h3>
        <ol className="mt-4 space-y-4 border-l border-neutral-200 pl-4 text-sm">
          <TimelineItem
            label="Payment created"
            value={formatTimestamp(transaction.createdAt)}
          />
          <TimelineItem
            label={`Attempt ${transaction.attempts} completed`}
            value={formatTimestamp(transaction.updatedAt)}
          />
        </ol>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-semibold text-neutral-950">{value}</dd>
    </div>
  );
}

function DetailBlock({
  label,
  mono,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-neutral-50 p-4">
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd
        className={`mt-2 wrap-break-word text-sm font-semibold text-neutral-950 ${mono ? "font-mono" : ""
          }`}
      >
        {value}
      </dd>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="relative">
      <span className="absolute -left-5.25 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      <p className="font-semibold text-neutral-950">{label}</p>
      <p className="mt-1 text-neutral-600">{value}</p>
    </li>
  );
}
