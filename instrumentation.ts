/**
 * Server/edge error monitoring (Sentry). Dormant until SENTRY_DSN is set —
 * same env-gated pattern as the rest of the integrations. onRequestError is
 * Next's native hook for server errors (render, route handlers, actions).
 */
import * as Sentry from "@sentry/nextjs";

export function register() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    // Never attach request bodies — transcripts/PII must not reach Sentry.
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
