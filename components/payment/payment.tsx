"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CardPreview } from "@/components/payment/card-preview";
import { PaymentForm } from "@/components/payment/payment-form";
import { PaymentStatusModal } from "@/components/payment/payment-status-modal";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import type { PaymentFormValues } from "@/types/payment";
import { initialPaymentValues } from "@/utils/payment-validation";

export function Payment() {
  const [previewValues, setPreviewValues] =
    useState<PaymentFormValues>(initialPaymentValues);
  const [formVersion, setFormVersion] = useState(0);
  const {
    canRetry,
    currentTransaction,
    isProcessing,
    lastMessage,
    resetPayment,
    retryPayment,
    status,
    submitPayment,
  } = usePaymentProcessor();

  const handleValuesChange = useCallback((values: PaymentFormValues) => {
    setPreviewValues(values);
  }, []);

  const handleReset = useCallback(() => {
    resetPayment();
    setPreviewValues(initialPaymentValues);
    setFormVersion((version) => version + 1);
  }, [resetPayment]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-neutral-950">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Secure checkout
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700">
            <Link
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 transition hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              href="/transactions"
            >
              View payments
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8">
        <div className="space-y-6">
          <PaymentForm
            disabled={isProcessing}
            key={formVersion}
            onSubmit={submitPayment}
            onValuesChange={handleValuesChange}
          />
        </div>

        <aside className="space-y-6">
          <CardPreview values={previewValues} />
        </aside>
      </main>

      <PaymentStatusModal
        canRetry={canRetry}
        lastMessage={lastMessage}
        onReset={handleReset}
        onRetry={retryPayment}
        status={status}
        transaction={currentTransaction}
      />
    </div>
  );
}
