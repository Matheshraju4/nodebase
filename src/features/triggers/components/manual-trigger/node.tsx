import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ManualTriggerNodeDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {

  const nodeStatus = "initial";
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenSettings = () => setDialogOpen(true);
  return (
    <>
      <ManualTriggerNodeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
