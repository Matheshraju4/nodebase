import type { Realtime } from "@inngest/realtime";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { geminiChannel } from "./channels/gemini";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openAiChannel } from "./channels/openai";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", retries: 0 },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
    ],
  },
  async (ctx) => {
    const { event, step, publish } = ctx as typeof ctx & {
      publish: Realtime.PublishFn;
    };
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is misssing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }
    return { workflowId, result: context };
  },
);
