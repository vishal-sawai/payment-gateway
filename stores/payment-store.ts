import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  GatewayResponse,
  PaymentPayload,
  PaymentStatus,
  Transaction,
  TransactionStatus,
} from "@/types/payment";
import { getCardLast4 } from "@/utils/card";

interface CompleteTransactionInput {
  transactionId: string;
  status: Extract<PaymentStatus, "success" | "failed" | "timeout">;
  message: string;
  reason?: string;
  approvalCode?: string;
}

interface PaymentStore {
  status: PaymentStatus;
  currentTransactionId: string | null;
  selectedTransactionId: string | null;
  history: Transaction[];
  lastMessage: string;
  beginTransaction: (payload: PaymentPayload, attempt: number) => void;
  completeTransaction: (input: CompleteTransactionInput) => void;
  completeFromGateway: (response: GatewayResponse) => void;
  selectTransaction: (transactionId: string | null) => void;
  resetFlow: () => void;
}

function upsertTransaction(
  history: Transaction[],
  transaction: Transaction,
): Transaction[] {
  const existingIndex = history.findIndex((item) => item.id === transaction.id);

  if (existingIndex === -1) {
    return [transaction, ...history];
  }

  return history.map((item, index) =>
    index === existingIndex ? transaction : item,
  );
}

function getProcessingTransaction(
  payload: PaymentPayload,
  attempt: number,
  existing?: Transaction,
): Transaction {
  const now = new Date().toISOString();

  return {
    id: payload.transactionId,
    amount: payload.amount,
    currency: payload.currency,
    status: "processing",
    attempts: attempt,
    cardholderName: payload.cardholderName,
    cardType: payload.cardType,
    cardLast4: getCardLast4(payload.cardNumber),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    message: `Authorising attempt ${attempt}`,
    reason: undefined,
    approvalCode: undefined,
  };
}

function resolveTransaction(
  transaction: Transaction,
  input: CompleteTransactionInput,
): Transaction {
  return {
    ...transaction,
    status: input.status as TransactionStatus,
    updatedAt: new Date().toISOString(),
    message: input.message,
    reason: input.reason,
    approvalCode: input.approvalCode,
  };
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      status: "idle",
      currentTransactionId: null,
      selectedTransactionId: null,
      history: [],
      lastMessage: "Ready when you are.",
      beginTransaction: (payload, attempt) => {
        const existing = get().history.find(
          (item) => item.id === payload.transactionId,
        );
        const transaction = getProcessingTransaction(payload, attempt, existing);

        set((state) => ({
          status: "processing",
          currentTransactionId: payload.transactionId,
          selectedTransactionId: payload.transactionId,
          lastMessage: transaction.message,
          history: upsertTransaction(state.history, transaction),
        }));
      },
      completeTransaction: (input) => {
        set((state) => {
          const transaction = state.history.find(
            (item) => item.id === input.transactionId,
          );

          if (!transaction) {
            return {
              status: input.status,
              lastMessage: input.message,
            };
          }

          const resolvedTransaction = resolveTransaction(transaction, input);

          return {
            status: input.status,
            currentTransactionId: input.transactionId,
            selectedTransactionId: input.transactionId,
            lastMessage: input.message,
            history: upsertTransaction(state.history, resolvedTransaction),
          };
        });
      },
      completeFromGateway: (response) => {
        get().completeTransaction({
          transactionId: response.transactionId,
          status: response.status,
          message: response.message,
          reason: response.reason,
          approvalCode: response.approvalCode,
        });
      },
      selectTransaction: (transactionId) => {
        set({ selectedTransactionId: transactionId });
      },
      resetFlow: () => {
        set({
          status: "idle",
          currentTransactionId: null,
          lastMessage: "Ready when you are.",
        });
      },
    }),
    {
      name: "payment-gateway-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
);
