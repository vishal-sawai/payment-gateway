"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PaymentFormValues, PaymentPayload } from "@/types/payment";
import { usePaymentStore } from "@/stores/payment-store";
import {
  FRONTEND_TIMEOUT_MS,
  MAX_PAYMENT_ATTEMPTS,
  PROCESSING_DELAY_MS,
  toPaymentPayload,
  wait,
} from "@/utils/payment";
import {
  postPayment,
} from "@/utils/payment-api";
import { getFailedStatusForError, getFriendlyPaymentError } from "@/utils/error";

async function holdProcessing(startedAt: number): Promise<void> {
  const elapsed = Date.now() - startedAt;

  if (elapsed < PROCESSING_DELAY_MS) {
    await wait(PROCESSING_DELAY_MS - elapsed);
  }
}

export function usePaymentProcessor() {
  const activePayloadRef = useRef<PaymentPayload | null>(null);
  const [hasActivePayload, setHasActivePayload] = useState(false);
  const status = usePaymentStore((state) => state.status);
  const history = usePaymentStore((state) => state.history);
  const currentTransactionId = usePaymentStore(
    (state) => state.currentTransactionId,
  );
  const lastMessage = usePaymentStore((state) => state.lastMessage);
  const beginTransaction = usePaymentStore((state) => state.beginTransaction);
  const completeFromGateway = usePaymentStore(
    (state) => state.completeFromGateway,
  );
  const completeTransaction = usePaymentStore(
    (state) => state.completeTransaction,
  );
  const resetFlow = usePaymentStore((state) => state.resetFlow);

  const currentTransaction = useMemo(
    () => history.find((item) => item.id === currentTransactionId) ?? null,
    [currentTransactionId, history],
  );

  const runPayment = useCallback(
    async (payload: PaymentPayload, attempt: number) => {
      const controller = new AbortController();
      const startedAt = Date.now();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, FRONTEND_TIMEOUT_MS);

      beginTransaction(payload, attempt);

      try {
        const response = await postPayment(payload, controller.signal);

        await holdProcessing(startedAt);
        completeFromGateway(response);
      } catch (error) {
        await holdProcessing(startedAt);

        const failedStatus = getFailedStatusForError(error);
        const message = getFriendlyPaymentError(error);

        completeTransaction({
          transactionId: payload.transactionId,
          status: failedStatus,
          message,
          reason: failedStatus === "timeout" ? "Gateway timeout" : message,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [beginTransaction, completeFromGateway, completeTransaction],
  );

  const submitPayment = useCallback(
    (values: PaymentFormValues) => {
      const transactionId = crypto.randomUUID();
      const payload = toPaymentPayload(values, transactionId);

      activePayloadRef.current = payload;
      setHasActivePayload(true);
      void runPayment(payload, 1);
    },
    [runPayment],
  );

  const retryPayment = useCallback(() => {
    if (!currentTransaction || !activePayloadRef.current) {
      return;
    }

    if (currentTransaction.attempts >= MAX_PAYMENT_ATTEMPTS) {
      return;
    }

    void runPayment(activePayloadRef.current, currentTransaction.attempts + 1);
  }, [currentTransaction, runPayment]);

  const resetPayment = useCallback(() => {
    activePayloadRef.current = null;
    setHasActivePayload(false);
    resetFlow();
  }, [resetFlow]);

  const canRetry =
    hasActivePayload &&
    Boolean(currentTransaction) &&
    (status === "failed" || status === "timeout") &&
    (currentTransaction?.attempts ?? 0) < MAX_PAYMENT_ATTEMPTS;

  return {
    canRetry,
    currentTransaction,
    isProcessing: status === "processing",
    lastMessage,
    resetPayment,
    retryPayment,
    status,
    submitPayment,
  };
}
