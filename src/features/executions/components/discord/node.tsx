import { Node, NodeProps, useReactFlow } from "@xyflow/react";

import { memo, useState } from "react";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";

import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchDiscordRealtimeToken } from "./actions";
import { DiscordDialog, DiscordFormValues } from "./dialog";

type DiscordNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
};
type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DISCORD_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const nodeData = props.data;
  const description = nodeData?.content
    ? `Send: ${nodeData.content.slice(0, 50)}...`
    : "Not Configured";

  const handleSubmit = (values: DiscordFormValues) => {
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
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/discord.svg"}
        name="Discord"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

DiscordNode.displayName = "DiscordNode";
