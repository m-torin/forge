declare module '@repo/observability' {
  export function logError(message: string, context?: unknown): void;
  export function logInfo(message: string, context?: unknown): void;
  export function logDebug(message: string, context?: unknown): void;
  export function logWarn(message: string, context?: unknown): void;
}
