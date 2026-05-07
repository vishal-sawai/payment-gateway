import axios from "axios";
import type { GatewayResponse, PaymentPayload } from "@/types/payment";
import { isRecord } from "@/utils/helper";
import { isAbortError, PaymentRequestError } from "@/utils/error";


function isGatewayStatus(value: unknown): value is GatewayResponse["status"] {
  return value === "success" || value === "failed" || value === "timeout";
}

function isGatewayResponse(value: unknown): value is GatewayResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isGatewayStatus(value.status) &&
    typeof value.transactionId === "string" &&
    typeof value.message === "string"
  );
}

function getApiMessage(data: unknown, fallback: string): string {
  if (isRecord(data) && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

export async function postPayment(
  payload: PaymentPayload,
  signal: AbortSignal,
): Promise<GatewayResponse> {
  try {
    const response = await axios.post<unknown>("/api/pay", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    });

    const data = response.data;

    if (!isGatewayResponse(data)) {
      throw new PaymentRequestError(
        "The payment gateway returned an unexpected response.",
        "api",
      );
    }

    return data;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new PaymentRequestError(
          getApiMessage(
            error.response.data,
            "The payment gateway rejected the request.",
          ),
          "api",
        );
      }

      throw new PaymentRequestError(
        "We could not reach the payment gateway. Please check your connection and try again.",
        "network",
      );
    }

    throw error;
  }
}
