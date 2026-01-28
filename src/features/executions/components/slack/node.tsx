import { Node, NodeProps, useReactFlow } from "@xyflow/react";

import { memo, useState } from "react";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchSlackRealtimeToken } from "./actions";
import { SlackDialog, SlackFormValues } from "./dialog";

type SlackNodeData = {
  webhookUrl?: string;
  content?: string;
};
type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SLACK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const nodeData = props.data;
  const description = nodeData?.content
    ? `Send: ${nodeData.content.slice(0, 50)}...`
    : "Not Configured";

  const handleSubmit = (values: SlackFormValues) => {
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
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/slack.svg"}
        name="Slack"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

SlackNode.displayName = "SlackNode";
