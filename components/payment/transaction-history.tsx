"use client";

import Link from "next/link";
import type { Transaction, TransactionStatus } from "@/types/payment";
import { usePaymentStore } from "@/stores/payment-store";
import { formatMoney, STATUS_LABELS } from "@/utils/payment";

const STATUS_BADGE_CLASSES: Record<TransactionStatus, string> = {
  processing: "bg-cyan-50 text-cyan-800 border-cyan-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-rose-50 text-rose-800 border-rose-200",
  timeout: "bg-amber-50 text-amber-800 border-amber-200",
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function TransactionHistory() {
  const history = usePaymentStore((state) => state.history);
  const totals = getHistoryTotals(history);

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total payments" value={String(history.length)} />
        <SummaryCard label="Successful" value={String(totals.success)} />
        <SummaryCard label="Failed" value={String(totals.failed)} />
        <SummaryCard label="Timed out" value={String(totals.timeout)} />
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-950">
            Payment history
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Select a payment to view its full receipt and gateway response.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="p-6 text-sm text-neutral-600">
            Your payments will appear here after checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                <tr>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Attempts</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {history.map((transaction) => (
                  <tr
                    className="transition hover:bg-neutral-50"
                    key={transaction.id}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-950">
                        {transaction.cardholderName}
                      </p>
                      <p className="mt-1 max-w-[220px] truncate font-mono text-xs text-neutral-500">
                        {transaction.id}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-neutral-950">
                      {formatMoney(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      {transaction.attempts}
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      {formatTimestamp(transaction.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 px-3 text-xs font-semibold text-neutral-800 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        href={`/transactions/${transaction.id}`}
                      >
                        View receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function getHistoryTotals(history: Transaction[]) {
  return history.reduce(
    (totals, transaction) => ({
      success: totals.success + (transaction.status === "success" ? 1 : 0),
      failed: totals.failed + (transaction.status === "failed" ? 1 : 0),
      timeout: totals.timeout + (transaction.status === "timeout" ? 1 : 0),
    }),
    { success: 0, failed: 0, timeout: 0 },
  );
}
