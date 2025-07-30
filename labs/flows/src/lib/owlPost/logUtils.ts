import { logInfo, logError, logDebug } from '@repo/observability';

// logUtils.ts
export const logUtils = {
  stepStart: (step: string, data: any) => {
    logInfo('🔵 START: ' + step, { input: data });
  },

  stepEnd: (step: string, data: any) => {
    logInfo('✅ END: ' + step, { output: data });
  },

  error: (step: string, error: any) => {
    logError('❌ ERROR: ' + step, { error, details: error });
  },

  transform: (nodeId: string, before: any, after: any) => {
    logDebug('🔄 TRANSFORM: ' + nodeId, { before, after });
  },

  state: (message: string, data: any) => {
    logInfo('📊 STATE: ' + message, { data });
  },
};
