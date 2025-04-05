/**
 * Unified export for all Prisma clients and generated utilities
 */
export * as node from "./node";
export * as edge from "./edge";
export * as cloudflare from "./cloudflare";

export { prisma, createPrismaClient, Prisma, PrismaClient } from "./node";
export * as interfaces from "../../generated/interfaces/prisma-interfaces";
export * as jsonInterfaces from "../../generated/interfaces/prisma-json-interfaces";
export * as mockFactories from "../testing/mock-factories";
