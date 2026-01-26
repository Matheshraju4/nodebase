import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "@/features/executions/types";
import { anthropicAiChannel } from "@/inngest/channels/anthropic";

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
};
export const anthropicExecutor: NodeExecutor<anthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
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

  const credentialValue = process.env.ANTHROPIC_API_KEY!;

  const anthropic = createAnthropic({
    apiKey: credentialValue,
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
