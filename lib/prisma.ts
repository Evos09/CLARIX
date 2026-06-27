import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Protect Supabase pooler from connection exhaustion by enforcing a low connection limit
const rawUrl = process.env.DATABASE_URL;
let connectionString = rawUrl;

if (rawUrl) {
  try {
    const urlObj = new URL(rawUrl);
    if (!urlObj.searchParams.has("connection_limit")) {
      urlObj.searchParams.set("connection_limit", "2");
    }
    if (urlObj.port === "6543" && !urlObj.searchParams.has("pgbouncer")) {
      urlObj.searchParams.set("pgbouncer", "true");
    }
    connectionString = urlObj.toString();
  } catch (e) {
    if (!rawUrl.includes("connection_limit")) {
      const separator = rawUrl.includes("?") ? "&" : "?";
      connectionString = `${rawUrl}${separator}connection_limit=2`;
    }
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: connectionString
      ? {
          db: {
            url: connectionString,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
