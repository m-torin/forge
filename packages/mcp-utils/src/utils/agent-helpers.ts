/**
 * Agent helper utilities
 * Direct function exports for use in TypeScript code
 */

export interface MCPEntity {
  observations?: string[];
  [key: string]: any;
}

export interface AgentRequest {
  version: string;
  [key: string]: any;
}

export interface AgentResponse {
  success: boolean;
  timestamp: number;
  data?: any;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  request: AgentRequest;
}

export type EntityType = 
  | 'AnalysisSession'
  | 'FileAnalysis'
  | 'GitWorktree'
  | 'PullRequest'
  | 'ArchitecturalPattern'
  | 'VercelOptimization'
  | 'MockAnalysis'
  | 'UtilizationAnalysis'
  | 'WordRemoval';

/**
 * Extract observation value from MCP entity
 */
export function extractObservation(entity: MCPEntity, key: string): string | null {
  if (!entity?.observations) return null;

  for (const obs of entity.observations) {
    if (typeof obs === 'string' && obs.startsWith(`${key}:`)) {
      return obs.substring(key.length + 1);
    }
  }

  return null;
}

/**
 * Create standardized entity name for MCP memory
 */
export function createEntityName(entityType: EntityType, sessionId: string, additionalIds: string[] = []): string {
  let name = `${entityType}_${sessionId}`;
  
  if (additionalIds.length > 0) {
    name += '_' + additionalIds.join('_');
  }

  return name;
}

/**
 * Validate agent request format
 */
export function validateAgentRequest(request: AgentRequest | null | undefined, requiredFields: string[], version = '1.0'): ValidationResult {
  const errors: string[] = [];

  // Check if request exists
  if (!request || request === null || request === undefined) {
    errors.push('Request is null or undefined');
    return {
      valid: false,
      errors: errors,
      request: null as any
    };
  }

  // Check version
  if (!request.version) {
    errors.push('Missing required field: version');
  } else if (request.version !== version) {
    errors.push(`Version mismatch: expected ${version}, got ${request.version}`);
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in request) || request[field] === null || request[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    request: request
  };
}

/**
 * Format agent response
 */
export function formatAgentResponse(success: boolean, data?: any, error?: string): AgentResponse {
  const response: AgentResponse = {
    success,
    timestamp: Date.now()
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (error !== undefined) {
    response.error = error;
  }

  return response;
}