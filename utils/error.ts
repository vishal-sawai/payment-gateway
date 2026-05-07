import axios from "axios";
import type { PaymentStatus } from "@/types/payment";
import { PaymentRequestErrorKind } from "@/types/comman-type";


export class PaymentRequestError extends Error {
    kind: PaymentRequestErrorKind;

    constructor(message: string, kind: PaymentRequestErrorKind) {
        super(message);
        this.name = "PaymentRequestError";
        this.kind = kind;
    }
}

export function isAbortError(error: unknown): boolean {
    return (
        (error instanceof DOMException && error.name === "AbortError") ||
        (axios.isCancel(error) && error.name === "CanceledError")
    );
}

export function getFailedStatusForError(error: unknown): Extract<
    PaymentStatus,
    "failed" | "timeout"
> {
    return isAbortError(error) ? "timeout" : "failed";
}

export function getFriendlyPaymentError(error: unknown): string {
    if (isAbortError(error)) {
        return "The gateway took too long to respond. No charge was completed.";
    }

    if (error instanceof PaymentRequestError) {
        return error.message;
    }

    return "Something went wrong while processing the payment. Please try again.";
}
