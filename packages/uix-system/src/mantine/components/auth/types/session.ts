/**
 * Enhanced Session Types for Advanced Session Management
 */

export interface SessionDevice {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  engine?: string;
  fingerprint?: string;
}

export interface SessionLocation {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  isp?: string;
  isVpn?: boolean;
  isProxy?: boolean;
}

export interface SessionSecurity {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  riskFactors: string[];
  isFirstTimeLocation: boolean;
  isUnusualTime: boolean;
  hasSecureConnection: boolean;
  isTrustedDevice: boolean;
  failedLoginAttempts: number;
  lastFailedLoginAt?: string;
}

export interface SessionActivity {
  id: string;
  type: 'login' | 'logout' | 'switch' | 'refresh' | 'activity' | 'security_event';
  timestamp: string;
  details: {
    ip?: string;
    location?: string;
    userAgent?: string;
    description?: string;
    metadata?: Record<string, any>;
  };
}

export interface SessionMetrics {
  duration: number; // seconds
  pageViews: number;
  requestCount: number;
  dataTransferred: number; // bytes
  idleTime: number; // seconds
  activityLevel: 'high' | 'medium' | 'low';
}

export interface EnhancedSession {
  id: string;
  userId: string;
  userAgent: string;
  isCurrent: boolean;
  isActive: boolean;

  // Timestamps
  createdAt: string;
  lastActiveAt: string;
  expiresAt?: string;
  lastRefreshedAt?: string;

  // Device Information
  device: SessionDevice;

  // Location Information
  location: SessionLocation;

  // Security Information
  security: SessionSecurity;

  // Session Metrics
  metrics: SessionMetrics;

  // Activity History
  recentActivity: SessionActivity[];

  // Additional Metadata
  metadata: {
    sessionVersion?: string;
    clientVersion?: string;
    features?: string[];
    preferences?: Record<string, any>;
  };
}

export interface SessionStats {
  total: number;
  active: number;
  inactive: number;
  byDevice: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };
  byLocation: Array<{
    country: string;
    count: number;
  }>;
  byRiskLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  averageDuration: number;
  totalDataTransferred: number;
}

export interface SessionFilters {
  device?: ('desktop' | 'mobile' | 'tablet' | 'unknown')[];
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  location?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  isActive?: boolean;
  searchQuery?: string;
}

export interface SessionBulkAction {
  type: 'revoke' | 'trust' | 'flag' | 'export';
  sessionIds: string[];
  reason?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'new_location' | 'concurrent_sessions' | 'brute_force' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  sessionId?: string;
  isRead: boolean;
  actions: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface SessionManagementConfig {
  maxConcurrentSessions: number;
  sessionTimeout: number; // minutes
  enableLocationTracking: boolean;
  enableRiskScoring: boolean;
  autoRevokeHighRisk: boolean;
  notifications: {
    newDevice: boolean;
    newLocation: boolean;
    suspiciousActivity: boolean;
    weeklyReport: boolean;
  };
}

export interface BulkActionResult {
  total: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    sessionId: string;
    error: string;
  }>;
}
