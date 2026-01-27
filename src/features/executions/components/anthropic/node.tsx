import { Node, NodeProps, useReactFlow } from "@xyflow/react";

import { memo, useState } from "react";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";

import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchAnthropicAiRealtimeToken } from "./actions";
import {
  AnthropicDialog,
  AnthropicFormValues,
  AVAILABLE_MODELS,
} from "./dialog";

type AnthropicAiNodeData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
  // [key: string]: unknown;
};
type AnthropicAiNodeType = Node<AnthropicAiNodeData>;

export const AnthropicAiNode = memo((props: NodeProps<AnthropicAiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicAiRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not Configured";

  const handleSubmit = (values: AnthropicFormValues) => {
    console.log("Values", values);
    setNodes((nodes) =>
      nodes.map((node) => {
        console.log("Node Values", node);
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }

        return node;
      }),
    );
  };

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/anthropic.svg"}
        name="Anthropic"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

AnthropicAiNode.displayName = "AnthropicAiNode";
