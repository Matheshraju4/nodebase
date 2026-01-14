import { google } from "@ai-sdk/google";
import * as Sentry from "@sentry/nextjs";
import { generateText } from "ai";
import { Inngest } from "inngest";
import { email, z } from "zod";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
