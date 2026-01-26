"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { anthropicAiChannel } from "@/inngest/channels/anthropic";
import { inngest } from "@/inngest/client";

export type AnthropicAiToken = Realtime.Token<
  typeof anthropicAiChannel,
  ["status"]
>;

export async function fetchAnthropicAiRealtimeToken(): Promise<AnthropicAiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: anthropicAiChannel(),
    topics: ["status"],
  });
  return token;
}
