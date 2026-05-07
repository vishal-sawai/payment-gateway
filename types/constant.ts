
import type { PaymentStatus } from "@/types/payment";
import type { ModalView } from "@/types/comman-type";

export const MODAL_VIEW: Record<Exclude<PaymentStatus, "idle">, ModalView> = {
    processing: {
        accent: "bg-cyan-500",
        description: "Please wait while we confirm your payment.",
        title: "Authorising payment",
    },
    success: {
        accent: "bg-emerald-500",
        description: "Your payment has been approved.",
        title: "Payment successful",
    },
    failed: {
        accent: "bg-rose-500",
        description: "The payment was declined. You can retry this payment.",
        title: "Payment declined",
    },
    timeout: {
        accent: "bg-amber-500",
        description: "The bank took too long to respond. No charge was completed.",
        title: "Payment timed out",
    },
};

export const FAILURE_REASONS = [
    "Insufficient funds",
    "Issuer declined the authorization",
    "Card security check failed",
] as const;
