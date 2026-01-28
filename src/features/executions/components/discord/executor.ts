import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { NodeExecutor } from "@/features/executions/types";
import { discordChannel } from "@/inngest/channels/discord";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GeminiData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};
export const discordExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(discordChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: Variable name is missing");
  }

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: Message content is missing");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const userName = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: WebhookUrl is missing");
      }
      await ky.post(data.webhookUrl!, {
        json: {
          content: content.slice(0, 2000),
          userName,
        },
      });

      if (!data.variableName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });
    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw error;
  }
};
