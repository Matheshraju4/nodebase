import { NextRequest, NextResponse } from "next/server";
import { StripeTriggerDialog } from "@/features/triggers/components/stripe-trigger/dialog";
import { sendWorkflowExecution } from "@/inngest/utils";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query paramater: workflowId",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    console.log("raw Recieved Body", body);

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });
    return NextResponse.json(
      { success: true },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Stripe webhook error", error);

    return NextResponse.json(
      { success: false, error: "Failed to process Stripe Event" },
      {
        status: 500,
      },
    );
  }
}
