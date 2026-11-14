import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Rust-free Prisma client (engineType = "client") talks to Postgres through the pg driver adapter.
function create() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = db;
