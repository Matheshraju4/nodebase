// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c4ebe42d77e590822e724ba77752fd89@o4510656131235840.ingest.de.sentry.io/4510656133005392",

  integrations: [
    // Add the Vercel AI SDK integration to sentry.server.config.ts
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
  ],
  // Tracing must be enabled for agent monitoring to work
  tracesSampleRate: 1.0,
  sendDefaultPii: true,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
