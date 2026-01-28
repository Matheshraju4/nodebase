import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "@/features/executions/types";
import { anthropicAiChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);

  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type anthropicData = {
  variableName?: string;
  model?: string;
  sytemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};
export const anthropicExecutor: NodeExecutor<anthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(anthropicAiChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(
      anthropicAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("anthropic node: Variable name is missing");
  }
  if (!data.credentialId) {
    await publish(
      anthropicAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemini node: Credential is missing");
  }

  if (!data.userPrompt) {
    await publish(
      anthropicAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("anthropic node: User prompt is missing");
  }

  const systemPrompt = data.sytemPrompt
    ? Handlebars.compile(data.sytemPrompt)(context)
    : "You are a helpfull assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      anthropicAiChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("Anthropic node: Credential not found");
  }

  const anthropic = createAnthropic({
    apiKey: credential.value,
  });
  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("gpt-3.5-turbo") as any,
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicAiChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await publish(
      anthropicAiChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw error;
  }
};
