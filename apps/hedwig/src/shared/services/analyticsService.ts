import { Platform } from 'react-native'

import { Analytics } from '@repo/analytics/emitters'
import { log } from '@repo/observability/log'

// Note: Server-side tracking removed for React Native app

// Initialize universal analytics for mobile app
const analytics = new Analytics({
  providers: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    } : undefined,
    posthog: process.env.NEXT_PUBLIC_POSTHOG_KEY ? {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      config: {
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      }
    } : undefined,
    segment: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ? {
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    } : undefined,
  },
  debug: process.env.NODE_ENV === 'development',
  defaultAnonymousId: `hedwig_${Math.random().toString(36).substring(7)}`,
});

export interface ScanEvent {
  barcode?: string
  confidence?: number
  duration?: number
  error?: string
  metadata?: Record<string, any>
  platform?: 'ios' | 'android' | 'web'
  productId?: string
  type: 'barcode_scanned' | 'product_found' | 'product_not_found' | 'ai_search_started' | 'ai_search_completed' | 'product_imported'
}

export interface PerformanceMetric {
  barcode?: string
  duration: number
  error?: string
  operation: 'scan_to_result' | 'ai_search' | 'product_lookup' | 'product_import'
  success: boolean
}

export class AnalyticsService {
  private static sessionId = Math.random().toString(36).substring(7)
  private static scanCount = 0

  /**
   * Track a scanner-related event
   */
  static trackEvent(event: ScanEvent) {
    try {
      const enrichedEvent = {
        ...event,
        platform: event.platform || this.detectPlatform(),
        scanCount: this.scanCount,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }

      // Log to observability system
      log.info('Scanner Event', enrichedEvent)

      // Track with universal analytics
      analytics.track(event.type, {
        confidence: event.confidence,
        barcode: event.barcode,
        duration: event.duration,
        platform: enrichedEvent.platform,
        productId: event.productId,
        scanCount: this.scanCount,
        ...event.metadata
      })

      // Also track server-side for critical events
      this.trackServerSide(event.type, enrichedEvent)

      // Track specific metrics based on event type
      switch (event.type) {
        case 'barcode_scanned':
          this.scanCount++
          this.trackScanMetrics(event)
          break
        case 'ai_search_completed':
          this.trackAISearchMetrics(event)
          break
        case 'product_imported':
          this.trackImportMetrics(event)
          break
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(metric: PerformanceMetric) {
    try {
      const enrichedMetric = {
        ...metric,
        platform: this.detectPlatform(),
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }

      log.info('Performance Metric', enrichedMetric)

      // Alert on slow operations
      if (metric.duration > 5000) { // 5 seconds
        log.warn('Slow Operation Detected', enrichedMetric)
      }
    } catch (error) {
      console.error('Performance tracking failed:', error)
    }
  }

  /**
   * Track errors with context
   */
  static trackError(error: Error, context: Record<string, any> = {}) {
    try {
      const errorEvent = {
        context,
        error: error.message,
        platform: this.detectPlatform(),
        sessionId: this.sessionId,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }

      log.error('Scanner Error', errorEvent)
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError)
    }
  }

  /**
   * Track user journey through the scanner flow
   */
  static trackUserJourney(step: string, metadata: Record<string, any> = {}) {
    try {
      const journeyEvent = {
        metadata,
        platform: this.detectPlatform(),
        scanCount: this.scanCount,
        sessionId: this.sessionId,
        step,
        timestamp: new Date().toISOString()
      }

      log.info('User Journey', journeyEvent)
    } catch (error) {
      console.error('Journey tracking failed:', error)
    }
  }

  /**
   * Get session analytics summary
   */
  static getSessionSummary() {
    return {
      platform: this.detectPlatform(),
      scanCount: this.scanCount,
      sessionId: this.sessionId,
      startTime: new Date().toISOString()
    }
  }

  /**
   * Track events server-side for critical analytics (disabled in React Native)
   */
  private static async trackServerSide(eventType: string, data: any) {
    // Server-side tracking not available in React Native app
    console.log('Server-side analytics would track:', eventType, data)
  }

  private static trackScanMetrics(event: ScanEvent) {
    // Track scan frequency and patterns
    const scanMetrics = {
      barcodeLength: event.barcode?.length,
      barcodeType: this.detectBarcodeType(event.barcode || ''),
      platform: event.platform,
      totalScans: this.scanCount
    }

    log.info('Scan Metrics', scanMetrics)
  }

  private static trackAISearchMetrics(event: ScanEvent) {
    // Track AI search performance and accuracy
    const aiMetrics = {
      confidence: event.confidence,
      barcode: event.barcode,
      duration: event.duration,
      success: !event.error
    }

    log.info('AI Search Metrics', aiMetrics)

    // Track confidence distribution
    if (event.confidence !== undefined) {
      const confidenceCategory = event.confidence > 0.8 ? 'high' :
                                event.confidence > 0.5 ? 'medium' : 'low'

      log.info('AI Confidence Distribution', {
        confidence: event.confidence,
        barcode: event.barcode,
        category: confidenceCategory
      })
    }
  }

  private static trackImportMetrics(event: ScanEvent) {
    // Track product import success rates
    const importMetrics = {
      confidence: event.confidence,
      barcode: event.barcode,
      productId: event.productId,
      success: !event.error
    }

    log.info('Import Metrics', importMetrics)
  }

  private static detectPlatform(): 'ios' | 'android' | 'web' {
    // Use React Native Platform API for accurate detection
    const platform = Platform.OS
    if (platform === 'ios') return 'ios'
    if (platform === 'android') return 'android'
    return 'web'
  }

  private static detectBarcodeType(barcode: string): string {
    const length = barcode.length
    if (length === 12) return 'UPC-A'
    if (length === 8) return 'UPC-E'
    if (length === 13) return 'EAN-13'
    if (length === 8) return 'EAN-8'
    if (length >= 6 && length <= 128) return 'Code-128'
    return 'Unknown'
  }
}

// Performance timing helper
export class PerformanceTimer {
  private startTime: number
  private operation: string

  constructor(operation: string) {
    this.operation = operation
    this.startTime = Date.now()
  }

  end(success = true, metadata: Record<string, any> = {}) {
    const duration = Date.now() - this.startTime

    AnalyticsService.trackPerformance({
      duration,
      operation: this.operation as any,
      success,
      ...metadata
    })

    return duration
  }
}
