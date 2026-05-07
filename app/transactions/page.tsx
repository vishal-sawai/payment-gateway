import Link from "next/link";
import { TransactionHistory } from "@/components/payment/transaction-history";
export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-neutral-950">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Payment history
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-950">
              Your recent payments
            </h1>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            href="/"
          >
            Back to checkout
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <TransactionHistory />
      </main>
    </div>
  );
}
