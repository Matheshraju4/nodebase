import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { NodeExecutor } from "@/features/executions/types";
import { slackChannel } from "@/inngest/channels/slack";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};
export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(slackChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: Variable name is missing");
  }

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: Message content is missing");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("Slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Slack node: WebhookUrl is missing");
      }
      await ky.post(data.webhookUrl!, {
        json: {
          content: content,
        },
      });

      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Slack node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });
    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw error;
  }
};
