import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { NodeType } from "@/generated/prisma/enums";
import { HttpRequestExecutor } from "../components/http-request/executor";
import { NodeExecutor } from "../types";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};

