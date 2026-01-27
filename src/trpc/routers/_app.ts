
import { credentialRouter } from "@/features/credential/server/routers";
import { workflowsRouter } from "@/features/workflows/server/routers";

import { createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
