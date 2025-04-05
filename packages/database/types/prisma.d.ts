import { type PrismaNeon } from "@prisma/adapter-neon";

declare module "./src/generated/client" {
  interface PrismaClientOptions {
    adapter?: PrismaNeon;
  }
}
