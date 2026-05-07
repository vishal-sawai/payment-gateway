import { wait } from "@/utils/payment";
import { isPaymentPayload, getFailureReason } from "@/utils/helper";


export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);

  if (!isPaymentPayload(payload)) {
    return Response.json(
      {
        message: "Payment request is incomplete or invalid.",
      },
      { status: 400 },
    );
  }

  const roll = Math.random();

  if (roll < 0.6) {
    return Response.json({
      status: "success",
      transactionId: payload.transactionId,
      message: "Payment approved. The authorization completed successfully.",
      approvalCode: crypto.randomUUID().split("-")[0].toUpperCase(),
    });
  }

  if (roll < 0.85) {
    const reason = getFailureReason();

    return Response.json({
      status: "failed",
      transactionId: payload.transactionId,
      message: "Payment declined by the simulated gateway.",
      reason,
    });
  }

  await wait(8000);

  return Response.json({
    status: "timeout",
    transactionId: payload.transactionId,
    message: "The gateway response arrived after the frontend timeout window.",
    reason: "Delayed gateway response",
  });
}
