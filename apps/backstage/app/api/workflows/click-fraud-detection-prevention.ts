/**
 * Click Fraud Detection & Prevention Workflow
 * Detect and prevent fraudulent clicks, impressions, and conversions using ML and behavioral analysis
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepBulkhead,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const FraudDetectionInput = z.object({
  actionConfig: z.object({
    autoBlock: z.boolean().default(false),
    createReports: z.boolean().default(true),
    publisherNotification: z.boolean().default(true),
    quarantineTime: z.number().default(24), // hours
    refundProcessing: z.boolean().default(true),
    updateBlacklists: z.boolean().default(true),
  }),
  analysisScope: z.object({
    all: z.boolean().default(false),
    campaigns: z.array(z.string()).optional(),
    geoTargets: z.array(z.string()).optional(),
    publishers: z.array(z.string()).optional(),
    timeRange: z.object({
      end: z.string().datetime(),
      start: z.string().datetime(),
    }),
  }),
  detectionConfig: z.object({
    algorithms: z
      .array(
        z.enum([
          'statistical_analysis',
          'machine_learning',
          'behavioral_patterns',
          'device_fingerprinting',
          'geolocation_analysis',
          'temporal_patterns',
          'network_analysis',
        ]),
      )
      .default(['statistical_analysis', 'machine_learning', 'behavioral_patterns']),
    blockSuspiciousTraffic: z.boolean().default(false),
    realTimeEnabled: z.boolean().default(true),
    sensitivity: z.enum(['low', 'medium', 'high', 'custom']).default('medium'),
    thresholds: z.object({
      botTraffic: z.number().default(0.08), // 8%
      clickThroughRate: z.object({
        max: z.number().default(0.15), // 15%
        min: z.number().default(0.01), // 1%
      }),
      conversionRate: z.object({
        max: z.number().default(0.1), // 10%
        min: z.number().default(0.005), // 0.5%
      }),
      duplicateClicks: z.number().default(0.05), // 5%
      suspiciousIPs: z.number().default(0.1), // 10%
    }),
  }),
  mlConfig: z.object({
    confidenceThreshold: z.number().min(0).max(1).default(0.8),
    continuousLearning: z.boolean().default(true),
    featureEngineering: z.boolean().default(true),
    modelTypes: z
      .array(
        z.enum(['anomaly_detection', 'classification', 'clustering', 'ensemble', 'deep_learning']),
      )
      .default(['anomaly_detection', 'classification']),
  }),
});

// Click event schema
const ClickEvent = z.object({
  campaignId: z.string(),
  clickDetails: z.object({
    adPosition: z.string().optional(),
    clickCoordinates: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    landingPage: z.string(),
    referrer: z.string().optional(),
    timeOnPage: z.number(), // seconds
  }),
  conversion: z
    .object({
      type: z.string().optional(),
      occurred: z.boolean(),
      value: z.number().optional(),
    })
    .optional(),
  device: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']),
    browser: z.string(),
    fingerprint: z.string(),
    os: z.string(),
    screenResolution: z.string(),
    userAgent: z.string(),
  }),
  eventId: z.string(),
  geolocation: z.object({
    city: z.string(),
    country: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    region: z.string(),
    timezone: z.string(),
  }),
  metadata: z.record(z.any()),
  network: z.object({
    ip: z.string(),
    isp: z.string().optional(),
    proxy: z.boolean().default(false),
    tor: z.boolean().default(false),
    vpn: z.boolean().default(false),
  }),
  publisherId: z.string(),
  sessionId: z.string(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
});

// Fraud detection result schema
const FraudDetectionResult = z.object({
  confidence: z.number().min(0).max(1),
  detected: z.boolean(),
  eventId: z.string(),
  fraudScore: z.number().min(0).max(100),
  fraudTypes: z.array(
    z.enum([
      'click_spam',
      'click_injection',
      'sdk_spoofing',
      'install_hijacking',
      'attribution_manipulation',
      'bot_traffic',
      'device_farm',
      'proxy_traffic',
      'geo_manipulation',
      'time_manipulation',
    ]),
  ),
  indicators: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      score: z.number(),
      severity: z.enum(['low', 'medium', 'high']),
    }),
  ),
  recommendations: z.array(
    z.object({
      action: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      reason: z.string(),
    }),
  ),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
});

// Step factory for ML fraud detection
const fraudDetectionMLFactory = createWorkflowStep(
  {
    name: 'ML Fraud Detector',
    category: 'ml',
    tags: ['fraud-detection', 'machine-learning', 'security'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, events, models } = context.input;
    const detectionResults = [];

    for (const event of events) {
      const result = await detectFraudML(event, models, config);
      detectionResults.push(result);
    }

    return detectionResults;
  },
);

// Mock ML fraud detection
async function detectFraudML(event: any, models: any[], config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 25));

  const features = extractFeatures(event);
  let fraudScore = 0;
  const indicators = [];
  const fraudTypes = [];

  // Anomaly detection
  if (config.modelTypes.includes('anomaly_detection')) {
    const anomalyScore = detectAnomalies(features);
    fraudScore += anomalyScore * 0.3;

    if (anomalyScore > 0.7) {
      indicators.push({
        type: 'anomaly_detection',
        description: 'Unusual behavioral patterns detected',
        score: anomalyScore,
        severity: anomalyScore > 0.9 ? 'high' : 'medium',
      });
    }
  }

  // Classification models
  if (config.modelTypes.includes('classification')) {
    const classificationScore = classifyFraud(features);
    fraudScore += classificationScore * 0.4;

    if (classificationScore > 0.6) {
      fraudTypes.push('bot_traffic');
      indicators.push({
        type: 'bot_classification',
        description: 'Classified as likely bot traffic',
        score: classificationScore,
        severity: classificationScore > 0.8 ? 'high' : 'medium',
      });
    }
  }

  // Clustering analysis
  if (config.modelTypes.includes('clustering')) {
    const clusterScore = analyzeCluster(features);
    fraudScore += clusterScore * 0.3;

    if (clusterScore > 0.6) {
      fraudTypes.push('device_farm');
      indicators.push({
        type: 'clustering_analysis',
        description: 'Grouped with suspicious device clusters',
        score: clusterScore,
        severity: 'medium',
      });
    }
  }

  fraudScore = Math.min(fraudScore * 100, 100);

  return {
    confidence: 0.7 + Math.random() * 0.3,
    detected: fraudScore > 60,
    eventId: event.eventId,
    fraudScore,
    fraudTypes,
    indicators,
    recommendations: generateRecommendations(fraudScore, fraudTypes),
    riskLevel: getFraudRiskLevel(fraudScore),
  };
}

function extractFeatures(event: any): any {
  return {
    clickTiming: calculateClickTiming(event),
    deviceFingerprint: event.device.fingerprint,
    deviceType: event.device.type,
    geolocation: `${event.geolocation.country}_${event.geolocation.region}`,
    hasConversion: event.conversion?.occurred || false,
    ipAddress: event.network.ip,
    networkFlags: {
      proxy: event.network.proxy,
      tor: event.network.tor,
      vpn: event.network.vpn,
    },
    timeOnPage: event.clickDetails.timeOnPage,
    userAgent: event.device.userAgent,
  };
}

function calculateClickTiming(event: any): number {
  // Simulate click timing analysis
  return Math.random() * 1000; // Milliseconds since page load
}

function detectAnomalies(features: any): number {
  // Simulate anomaly detection
  let anomalyScore = 0;

  // Very fast clicks are suspicious
  if (features.clickTiming < 100) {
    anomalyScore += 0.4;
  }

  // Network flags
  if (features.networkFlags.proxy || features.networkFlags.vpn) {
    anomalyScore += 0.3;
  }

  if (features.networkFlags.tor) {
    anomalyScore += 0.6;
  }

  // Very short time on page
  if (features.timeOnPage < 5) {
    anomalyScore += 0.3;
  }

  return Math.min(anomalyScore, 1);
}

function classifyFraud(features: any): number {
  // Simulate ML classification
  let fraudProbability = Math.random() * 0.3; // Base probability

  // Bot-like user agent patterns
  if (features.userAgent.includes('bot') || features.userAgent.includes('crawler')) {
    fraudProbability += 0.7;
  }

  // Suspicious device fingerprints
  if (
    features.deviceFingerprint.includes('emulator') ||
    features.deviceFingerprint.includes('farm')
  ) {
    fraudProbability += 0.5;
  }

  return Math.min(fraudProbability, 1);
}

function analyzeCluster(features: any): number {
  // Simulate clustering analysis
  return Math.random() * 0.8;
}

function getFraudRiskLevel(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function generateRecommendations(score: number, fraudTypes: string[]): any[] {
  const recommendations = [];

  if (score > 80) {
    recommendations.push({
      action: 'block_immediately',
      priority: 'high',
      reason: 'Critical fraud score detected',
    });
  } else if (score > 60) {
    recommendations.push({
      action: 'quarantine_for_review',
      priority: 'medium',
      reason: 'High fraud score requires manual review',
    });
  }

  if (fraudTypes.includes('bot_traffic')) {
    recommendations.push({
      action: 'update_bot_detection_rules',
      priority: 'medium',
      reason: 'Bot traffic patterns identified',
    });
  }

  if (fraudTypes.includes('device_farm')) {
    recommendations.push({
      action: 'blacklist_device_fingerprints',
      priority: 'high',
      reason: 'Device farm activity detected',
    });
  }

  return recommendations;
}

// Step 1: Collect click and conversion events
export const collectClickEventsStep = compose(
  createStepWithValidation(
    'collect-events',
    async (input: z.infer<typeof FraudDetectionInput>) => {
      const { analysisScope } = input;

      let events = [];

      // Collect events based on scope
      if (analysisScope.all) {
        events = await fetchAllClickEvents(analysisScope.timeRange);
      } else {
        if (analysisScope.campaigns) {
          const campaignEvents = await fetchEventsByCampaigns(
            analysisScope.campaigns,
            analysisScope.timeRange,
          );
          events.push(...campaignEvents);
        }
        if (analysisScope.publishers) {
          const publisherEvents = await fetchEventsByPublishers(
            analysisScope.publishers,
            analysisScope.timeRange,
          );
          events.push(...publisherEvents);
        }
        if (analysisScope.geoTargets) {
          const geoEvents = await fetchEventsByGeo(
            analysisScope.geoTargets,
            analysisScope.timeRange,
          );
          events.push(...geoEvents);
        }
      }

      // Remove duplicates
      const uniqueEvents = Array.from(new Map(events.map((e) => [e.eventId, e])).values());

      return {
        ...input,
        collectionStarted: new Date().toISOString(),
        events: uniqueEvents,
        timeRange: analysisScope.timeRange,
        totalEvents: uniqueEvents.length,
      };
    },
    (input) => !!input.analysisScope.timeRange.start && !!input.analysisScope.timeRange.end,
    (output) => output.events.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes
  (step) =>
    withStepMonitoring(step, {
      enableDetailedLogging: true,
      trackingMetrics: ['timeRangeHours'],
    }),
);

// Mock event fetching functions
async function fetchAllClickEvents(timeRange: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const count = 10000 + Math.floor(Math.random() * 40000);
  return generateMockClickEvents(count, timeRange);
}

async function fetchEventsByCampaigns(campaignIds: string[], timeRange: any): Promise<any[]> {
  const allEvents = await fetchAllClickEvents(timeRange);
  return allEvents.filter((e) => campaignIds.includes(e.campaignId));
}

async function fetchEventsByPublishers(publisherIds: string[], timeRange: any): Promise<any[]> {
  const allEvents = await fetchAllClickEvents(timeRange);
  return allEvents.filter((e) => publisherIds.includes(e.publisherId));
}

async function fetchEventsByGeo(geoTargets: string[], timeRange: any): Promise<any[]> {
  const allEvents = await fetchAllClickEvents(timeRange);
  return allEvents.filter((e) => geoTargets.includes(e.geolocation.country));
}

function generateMockClickEvents(count: number, timeRange: any): any[] {
  const startTime = new Date(timeRange.start).getTime();
  const endTime = new Date(timeRange.end).getTime();

  const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR', 'IN', 'MX'];
  const devices = ['desktop', 'mobile', 'tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const oses = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];

  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(startTime + Math.random() * (endTime - startTime));
    const country = countries[Math.floor(Math.random() * countries.length)];
    const deviceType = devices[Math.floor(Math.random() * devices.length)];
    const hasConversion = Math.random() < 0.03; // 3% conversion rate

    return {
      campaignId: `campaign_${Math.floor(Math.random() * 100)}`,
      clickDetails: {
        adPosition: ['top', 'bottom', 'sidebar', 'inline'][Math.floor(Math.random() * 4)],
        clickCoordinates: {
          x: Math.floor(Math.random() * 1920),
          y: Math.floor(Math.random() * 1080),
        },
        landingPage: `https://example.com/landing${Math.floor(Math.random() * 10)}`,
        referrer:
          Math.random() > 0.2 ? `https://referrer${Math.floor(Math.random() * 20)}.com` : undefined,
        timeOnPage: Math.random() * 300, // 0-5 minutes
      },
      conversion: hasConversion
        ? {
            type: ['purchase', 'signup', 'download'][Math.floor(Math.random() * 3)],
            occurred: true,
            value: 10 + Math.random() * 990,
          }
        : { occurred: false },
      device: {
        type: deviceType,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        fingerprint: `fp_${Math.random().toString(36).substr(2, 16)}`,
        os: oses[Math.floor(Math.random() * oses.length)],
        screenResolution: generateScreenResolution(deviceType),
        userAgent: generateUserAgent(deviceType),
      },
      eventId: `evt_${i}`,
      geolocation: {
        city: `City_${Math.floor(Math.random() * 50)}`,
        country,
        latitude: -90 + Math.random() * 180,
        longitude: -180 + Math.random() * 360,
        region: `Region_${Math.floor(Math.random() * 10)}`,
        timezone: generateTimezone(country),
      },
      metadata: {
        processed: false,
        quality: Math.random(),
        source: 'ad_network',
      },
      network: {
        ip: generateIP(),
        isp: Math.random() > 0.8 ? `ISP_${Math.floor(Math.random() * 50)}` : undefined,
        proxy: Math.random() < 0.05, // 5% proxy traffic
        tor: Math.random() < 0.001, // 0.1% Tor traffic
        vpn: Math.random() < 0.03, // 3% VPN traffic
      },
      publisherId: `pub_${Math.floor(Math.random() * 200)}`,
      sessionId: `sess_${i}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestamp.toISOString(),
      userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 10000)}` : undefined,
    };
  });
}

function generateUserAgent(deviceType: string): string {
  const userAgents = {
    desktop: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ],
    mobile: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
      'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
    ],
    tablet: [
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Tablet; rv:68.0) Gecko/68.0 Firefox/88.0',
    ],
  };

  const agentList = userAgents[deviceType as any] || userAgents.desktop;
  return agentList[Math.floor(Math.random() * agentList.length)];
}

function generateScreenResolution(deviceType: string): string {
  const resolutions = {
    desktop: ['1920x1080', '2560x1440', '1366x768', '3840x2160'],
    mobile: ['375x667', '414x896', '360x640', '393x851'],
    tablet: ['768x1024', '820x1180', '834x1194', '1024x768'],
  };

  const resList = resolutions[deviceType as any] || resolutions.desktop;
  return resList[Math.floor(Math.random() * resList.length)];
}

function generateIP(): string {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function generateTimezone(country: string): string {
  const timezones = {
    AU: 'Australia/Sydney',
    BR: 'America/Sao_Paulo',
    CA: 'America/Toronto',
    DE: 'Europe/Berlin',
    FR: 'Europe/Paris',
    IN: 'Asia/Kolkata',
    JP: 'Asia/Tokyo',
    MX: 'America/Mexico_City',
    UK: 'Europe/London',
    US: 'America/New_York',
  };

  return timezones[country as any] || 'UTC';
}

// Step 2: Perform statistical analysis
export const performStatisticalAnalysisStep = createStep(
  'statistical-analysis',
  async (data: any) => {
    const { detectionConfig, events } = data;

    if (!detectionConfig.algorithms.includes('statistical_analysis')) {
      return {
        ...data,
        statisticalAnalysisSkipped: true,
      };
    }

    const analysis = {
      clickPatterns: analyzeClickPatterns(events),
      conversionRates: analyzeConversionRates(events),
      deviceDistribution: analyzeDeviceDistribution(events),
      geographicDistribution: analyzeGeographicDistribution(events),
      networkAnalysis: analyzeNetworkPatterns(events),
      temporalPatterns: analyzeTemporalPatterns(events),
    };

    const anomalies = detectStatisticalAnomalies(analysis, detectionConfig.thresholds);

    return {
      ...data,
      statisticalAnalysis: analysis,
      statisticalAnalysisComplete: true,
      statisticalAnomalies: anomalies,
    };
  },
);

function analyzeClickPatterns(events: any[]): any {
  const patterns = {
    avgTimeOnPage: events.reduce((sum, e) => sum + e.clickDetails.timeOnPage, 0) / events.length,
    clickVelocity: calculateClickVelocity(events),
    totalClicks: events.length,
    uniqueDevices: new Set(events.map((e) => e.device.fingerprint)).size,
    uniqueIPs: new Set(events.map((e) => e.network.ip)).size,
    uniqueUsers: new Set(events.map((e) => e.userId).filter(Boolean)).size,
  };

  return {
    ...patterns,
    clicksPerDevice: patterns.totalClicks / Math.max(1, patterns.uniqueDevices),
    clicksPerIP: patterns.totalClicks / Math.max(1, patterns.uniqueIPs),
    clicksPerUser: patterns.totalClicks / Math.max(1, patterns.uniqueUsers),
  };
}

function calculateClickVelocity(events: any[]): any {
  // Group clicks by minute
  const clicksByMinute = new Map();

  events.forEach((event) => {
    const minute = new Date(event.timestamp).toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
    clicksByMinute.set(minute, (clicksByMinute.get(minute) || 0) + 1);
  });

  const velocities = Array.from(clicksByMinute.values());

  return {
    avgClicksPerMinute: velocities.reduce((sum, v) => sum + v, 0) / velocities.length,
    maxClicksPerMinute: Math.max(...velocities),
    velocitySpikes: velocities.filter(
      (v) => v > (velocities.reduce((sum, v) => sum + v, 0) / velocities.length) * 3,
    ).length,
  };
}

function analyzeConversionRates(events: any[]): any {
  const conversions = events.filter((e) => e.conversion?.occurred);
  const totalClicks = events.length;

  const overallRate = conversions.length / totalClicks;

  // Conversion rates by campaign
  const byCampaign = new Map();
  events.forEach((event) => {
    const campaign = event.campaignId;
    if (!byCampaign.has(campaign)) {
      byCampaign.set(campaign, { clicks: 0, conversions: 0 });
    }
    const campaignData = byCampaign.get(campaign);
    campaignData.clicks++;
    if (event.conversion?.occurred) {
      campaignData.conversions++;
    }
  });

  const campaignRates = Array.from(byCampaign.entries()).map(([campaign, data]) => ({
    campaign,
    clicks: data.clicks,
    conversions: data.conversions,
    rate: data.conversions / data.clicks,
  }));

  return {
    averageCampaignRate: campaignRates.reduce((sum, c) => sum + c.rate, 0) / campaignRates.length,
    campaigns: campaignRates,
    maxCampaignRate: Math.max(...campaignRates.map((c) => c.rate)),
    minCampaignRate: Math.min(...campaignRates.map((c) => c.rate)),
    overall: overallRate,
  };
}

function analyzeGeographicDistribution(events: any[]): any {
  const byCountry = new Map();

  events.forEach((event) => {
    const country = event.geolocation.country;
    byCountry.set(country, (byCountry.get(country) || 0) + 1);
  });

  const distribution = Array.from(byCountry.entries())
    .map(([country, count]) => ({
      count,
      country,
      percentage: (count / events.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    concentrationRatio: distribution.slice(0, 3).reduce((sum, c) => sum + c.percentage, 0),
    distribution,
    topCountry: distribution[0],
    uniqueCountries: distribution.length,
  };
}

function analyzeDeviceDistribution(events: any[]): any {
  const byType = new Map();
  const byOS = new Map();
  const byBrowser = new Map();

  events.forEach((event) => {
    byType.set(event.device.type, (byType.get(event.device.type) || 0) + 1);
    byOS.set(event.device.os, (byOS.get(event.device.os) || 0) + 1);
    byBrowser.set(event.device.browser, (byBrowser.get(event.device.browser) || 0) + 1);
  });

  return {
    browsers: Array.from(byBrowser.entries()).map(([browser, count]) => ({ browser, count })),
    deviceTypes: Array.from(byType.entries()).map(([type, count]) => ({ type, count })),
    operatingSystems: Array.from(byOS.entries()).map(([os, count]) => ({ count, os })),
  };
}

function analyzeTemporalPatterns(events: any[]): any {
  const byHour = new Map();
  const byDayOfWeek = new Map();

  events.forEach((event) => {
    const date = new Date(event.timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    byHour.set(hour, (byHour.get(hour) || 0) + 1);
    byDayOfWeek.set(dayOfWeek, (byDayOfWeek.get(dayOfWeek) || 0) + 1);
  });

  return {
    hourlyDistribution: Array.from(byHour.entries()).map(([hour, count]) => ({ count, hour })),
    dailyDistribution: Array.from(byDayOfWeek.entries()).map(([day, count]) => ({ count, day })),
    peakDay: Array.from(byDayOfWeek.entries()).sort((a, b) => b[1] - a[1])[0],
    peakHour: Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0],
  };
}

function analyzeNetworkPatterns(events: any[]): any {
  const proxyTraffic = events.filter((e) => e.network.proxy).length;
  const vpnTraffic = events.filter((e) => e.network.vpn).length;
  const torTraffic = events.filter((e) => e.network.tor).length;

  const ipDistribution = new Map();
  events.forEach((event) => {
    const ip = event.network.ip;
    ipDistribution.set(ip, (ipDistribution.get(ip) || 0) + 1);
  });

  const suspiciousIPs = Array.from(ipDistribution.entries())
    .filter(([ip, count]) => count > 100) // More than 100 clicks from single IP
    .map(([ip, count]) => ({ count, ip }));

  return {
    highVolumeIPs: suspiciousIPs.length,
    proxyPercentage: (proxyTraffic / events.length) * 100,
    suspiciousIPs,
    torPercentage: (torTraffic / events.length) * 100,
    uniqueIPs: ipDistribution.size,
    vpnPercentage: (vpnTraffic / events.length) * 100,
  };
}

function detectStatisticalAnomalies(analysis: any, thresholds: any): any[] {
  const anomalies = [];

  // Conversion rate anomalies
  if (analysis.conversionRates.overall < thresholds.conversionRate.min) {
    anomalies.push({
      type: 'low_conversion_rate',
      description: 'Overall conversion rate below expected minimum',
      severity: 'medium',
      threshold: thresholds.conversionRate.min,
      value: analysis.conversionRates.overall,
    });
  }

  if (analysis.conversionRates.overall > thresholds.conversionRate.max) {
    anomalies.push({
      type: 'high_conversion_rate',
      description: 'Suspiciously high conversion rate',
      severity: 'high',
      threshold: thresholds.conversionRate.max,
      value: analysis.conversionRates.overall,
    });
  }

  // Network anomalies
  if (analysis.networkAnalysis.proxyPercentage > thresholds.suspiciousIPs * 100) {
    anomalies.push({
      type: 'high_proxy_traffic',
      description: 'High percentage of proxy traffic detected',
      severity: 'medium',
      threshold: thresholds.suspiciousIPs * 100,
      value: analysis.networkAnalysis.proxyPercentage,
    });
  }

  // Click pattern anomalies
  if (analysis.clickPatterns.clicksPerIP > 50) {
    anomalies.push({
      type: 'ip_concentration',
      description: 'High concentration of clicks from individual IPs',
      severity: 'high',
      value: analysis.clickPatterns.clicksPerIP,
    });
  }

  // Device anomalies
  if (analysis.clickPatterns.clicksPerDevice > 100) {
    anomalies.push({
      type: 'device_concentration',
      description: 'High concentration of clicks from individual devices',
      severity: 'high',
      value: analysis.clickPatterns.clicksPerDevice,
    });
  }

  return anomalies;
}

// Step 3: Run ML fraud detection models
export const runMLFraudDetectionStep = compose(
  createStep('ml-fraud-detection', async (data: any) => {
    const { detectionConfig, events, mlConfig } = data;

    if (!detectionConfig.algorithms.includes('machine_learning')) {
      return {
        ...data,
        mlDetectionSkipped: true,
      };
    }

    // Process events in batches
    const batchSize = 1000;
    const allDetectionResults = [];

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);

      const batchResults = await fraudDetectionMLFactory.handler({
        input: {
          config: mlConfig,
          events: batch,
          models: mlConfig.modelTypes,
        },
      });

      allDetectionResults.push(...batchResults);

      console.log(
        `Processed ML fraud detection for ${Math.min(i + batchSize, events.length)}/${events.length} events`,
      );
    }

    // Aggregate results
    const fraudulentEvents = allDetectionResults.filter((r) => r.detected);
    const highRiskEvents = allDetectionResults.filter(
      (r) => r.riskLevel === 'high' || r.riskLevel === 'critical',
    );

    return {
      ...data,
      fraudulentEvents,
      highRiskEvents,
      mlDetectionComplete: true,
      mlDetectionResults: allDetectionResults,
      mlDetectionStats: {
        averageFraudScore:
          allDetectionResults.reduce((sum, r) => sum + r.fraudScore, 0) /
          allDetectionResults.length,
        fraudDetected: fraudulentEvents.length,
        fraudRate: fraudulentEvents.length / allDetectionResults.length,
        highRiskRate: highRiskEvents.length / allDetectionResults.length,
        totalAnalyzed: allDetectionResults.length,
      },
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 8,
      maxQueued: 40,
    }),
  (step) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 300000, // 5 minutes
      threshold: 0.5,
      timeout: 600000, // 10 minutes
    }),
);

// Step 4: Analyze behavioral patterns
export const analyzeBehavioralPatternsStep = createStep(
  'behavioral-analysis',
  async (data: any) => {
    const { detectionConfig, events } = data;

    if (!detectionConfig.algorithms.includes('behavioral_patterns')) {
      return {
        ...data,
        behavioralAnalysisSkipped: true,
      };
    }

    const behavioralInsights = {
      clickSequencePatterns: analyzeClickSequences(events),
      deviceFingerprintClusters: analyzeDeviceFingerprints(events),
      sessionBehaviorAnalysis: analyzeSessionBehavior(events),
      suspiciousBehaviorFlags: identifySuspiciousBehavior(events),
      userJourneyAnalysis: analyzeUserJourneys(events),
    };

    return {
      ...data,
      behavioralAnalysis: behavioralInsights,
      behavioralAnalysisComplete: true,
    };
  },
);

function analyzeUserJourneys(events: any[]): any {
  const userJourneys = new Map();

  events.forEach((event) => {
    if (event.userId) {
      if (!userJourneys.has(event.userId)) {
        userJourneys.set(event.userId, []);
      }
      userJourneys.get(event.userId).push(event);
    }
  });

  const journeyStats: any[] = [];
  userJourneys.forEach((journey, userId) => {
    const sortedJourney = journey.sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    journeyStats.push({
      avgTimeOnPage:
        journey.reduce((sum: any, e: any) => sum + e.clickDetails.timeOnPage, 0) / journey.length,
      clickCount: journey.length,
      conversionCount: journey.filter((e: any) => e.conversion?.occurred).length,
      sessionDuration:
        new Date(sortedJourney[sortedJourney.length - 1].timestamp).getTime() -
        new Date(sortedJourney[0].timestamp).getTime(),
      uniqueCampaigns: new Set(journey.map((e: any) => e.campaignId)).size,
      userId,
    });
  });

  // Identify suspicious journey patterns
  const suspiciousJourneys = journeyStats.filter(
    (j) =>
      j.clickCount > 20 || // Too many clicks
      j.sessionDuration < 60000 || // Very short session with multiple clicks
      j.avgTimeOnPage < 5, // Very short time on pages
  );

  return {
    averageClicksPerJourney:
      journeyStats.reduce((sum, j) => sum + j.clickCount, 0) / journeyStats.length,
    journeyPatterns: journeyStats.slice(0, 100), // Sample for analysis
    suspiciousJourneys: suspiciousJourneys.length,
    totalJourneys: journeyStats.length,
  };
}

function analyzeClickSequences(events: any[]): any {
  // Group by session
  const sessionGroups = new Map();

  events.forEach((event) => {
    if (!sessionGroups.has(event.sessionId)) {
      sessionGroups.set(event.sessionId, []);
    }
    sessionGroups.get(event.sessionId).push(event);
  });

  const sequencePatterns: any[] = [];
  sessionGroups.forEach((session, sessionId) => {
    if (session.length > 1) {
      const sortedSession = session.sort(
        (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // Analyze click timing intervals
      const intervals = [];
      for (let i = 1; i < sortedSession.length; i++) {
        const interval =
          new Date(sortedSession[i].timestamp).getTime() -
          new Date(sortedSession[i - 1].timestamp).getTime();
        intervals.push(interval);
      }

      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
      const minInterval = Math.min(...intervals);

      sequencePatterns.push({
        averageInterval: avgInterval,
        clickCount: session.length,
        minimumInterval: minInterval,
        sessionId,
        suspicious: minInterval < 1000 || avgInterval < 5000, // Less than 1s min or 5s avg
        uniformity: calculateUniformity(intervals),
      });
    }
  });

  return {
    averageClicksPerSequence:
      sequencePatterns.reduce((sum, s) => sum + s.clickCount, 0) / sequencePatterns.length,
    fastClickingSessions: sequencePatterns.filter((s) => s.minimumInterval < 500).length,
    suspiciousSequences: sequencePatterns.filter((s) => s.suspicious).length,
    totalSequences: sequencePatterns.length,
  };
}

function calculateUniformity(intervals: number[]): number {
  if (intervals.length < 2) return 0;

  const avg = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avg, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  return stdDev / avg; // Coefficient of variation
}

function analyzeSessionBehavior(events: any[]): any {
  const sessionStats = new Map();

  events.forEach((event) => {
    if (!sessionStats.has(event.sessionId)) {
      sessionStats.set(event.sessionId, {
        campaigns: new Set(),
        devices: new Set(),
        events: [],
        geolocations: new Set(),
        publishers: new Set(),
      });
    }

    const session = sessionStats.get(event.sessionId);
    session.events.push(event);
    session.campaigns.add(event.campaignId);
    session.publishers.add(event.publisherId);
    session.geolocations.add(`${event.geolocation.country}_${event.geolocation.city}`);
    session.devices.add(event.device.fingerprint);
  });

  const behaviorAnalysis: any[] = [];
  sessionStats.forEach((session, sessionId) => {
    const events = session.events.sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    behaviorAnalysis.push({
      conversionRate: events.filter((e: any) => e.conversion?.occurred).length / events.length,
      deviceSwitching: session.devices.size > 1,
      duration:
        events.length > 1
          ? new Date(events[events.length - 1].timestamp).getTime() -
            new Date(events[0].timestamp).getTime()
          : 0,
      eventCount: events.length,
      geoSwitching: session.geolocations.size > 1,
      sessionId,
      suspicious: session.geolocations.size > 1 || session.devices.size > 1 || events.length > 50,
      uniqueCampaigns: session.campaigns.size,
      uniquePublishers: session.publishers.size,
    });
  });

  return {
    deviceSwitchingSessions: behaviorAnalysis.filter((s) => s.deviceSwitching).length,
    geoSwitchingSessions: behaviorAnalysis.filter((s) => s.geoSwitching).length,
    highVolumeSessions: behaviorAnalysis.filter((s) => s.eventCount > 20).length,
    suspiciousSessions: behaviorAnalysis.filter((s) => s.suspicious).length,
    totalSessions: behaviorAnalysis.length,
  };
}

function analyzeDeviceFingerprints(events: any[]): any {
  const fingerprintGroups = new Map();

  events.forEach((event) => {
    const fingerprint = event.device.fingerprint;
    if (!fingerprintGroups.has(fingerprint)) {
      fingerprintGroups.set(fingerprint, {
        events: [],
        ips: new Set(),
        sessions: new Set(),
        users: new Set(),
      });
    }

    const group = fingerprintGroups.get(fingerprint);
    group.events.push(event);
    if (event.userId) group.users.add(event.userId);
    group.ips.add(event.network.ip);
    group.sessions.add(event.sessionId);
  });

  const clusters: any[] = [];
  fingerprintGroups.forEach((group, fingerprint) => {
    clusters.push({
      eventCount: group.events.length,
      fingerprint,
      suspicious: group.events.length > 100 || group.ips.size > 20 || group.users.size > 50,
      uniqueIPs: group.ips.size,
      uniqueSessions: group.sessions.size,
      uniqueUsers: group.users.size,
    });
  });

  const suspiciousClusters = clusters.filter((c) => c.suspicious);

  return {
    deviceFarmIndicators: suspiciousClusters.filter((c) => c.uniqueUsers > 20 && c.eventCount > 500)
      .length,
    highVolumeDevices: clusters.filter((c) => c.eventCount > 100).length,
    suspiciousFingerprints: suspiciousClusters.length,
    totalFingerprints: clusters.length,
  };
}

function identifySuspiciousBehavior(events: any[]): any[] {
  const flags = [];

  // Time-based analysis
  const veryFastClicks = events.filter((e) => e.clickDetails.timeOnPage < 3).length;
  if (veryFastClicks > events.length * 0.2) {
    flags.push({
      type: 'fast_clicking',
      count: veryFastClicks,
      description: 'High percentage of very fast clicks detected',
      percentage: (veryFastClicks / events.length) * 100,
      severity: 'high',
    });
  }

  // Identical coordinate patterns
  const coordinateGroups = new Map();
  events.forEach((event) => {
    if (event.clickDetails.clickCoordinates) {
      const coord = `${event.clickDetails.clickCoordinates.x},${event.clickDetails.clickCoordinates.y}`;
      coordinateGroups.set(coord, (coordinateGroups.get(coord) || 0) + 1);
    }
  });

  const identicalCoordinates = Array.from(coordinateGroups.values()).filter(
    (count) => count > 10,
  ).length;
  if (identicalCoordinates > 5) {
    flags.push({
      type: 'identical_coordinates',
      count: identicalCoordinates,
      description: 'Multiple clicks at identical coordinates detected',
      severity: 'medium',
    });
  }

  // User agent clustering
  const userAgentGroups = new Map();
  events.forEach((event) => {
    const ua = event.device.userAgent;
    userAgentGroups.set(ua, (userAgentGroups.get(ua) || 0) + 1);
  });

  const dominantUserAgent = Math.max(...Array.from(userAgentGroups.values()));
  if (dominantUserAgent > events.length * 0.5) {
    flags.push({
      type: 'user_agent_clustering',
      count: dominantUserAgent,
      description: 'High concentration of identical user agents',
      percentage: (dominantUserAgent / events.length) * 100,
      severity: 'medium',
    });
  }

  return flags;
}

// Step 5: Generate fraud prevention actions
export const generatePreventionActionsStep = createStep('generate-actions', async (data: any) => {
  const {
    actionConfig,
    behavioralAnalysis,
    fraudulentEvents,
    highRiskEvents,
    statisticalAnomalies,
  } = data;

  const actions = [];
  const blockedEvents = [];
  const quarantinedEvents = [];

  // Process fraudulent events
  for (const event of fraudulentEvents || []) {
    const action = generateActionForEvent(event, actionConfig);
    actions.push(action);

    if (action.type === 'block') {
      blockedEvents.push(event.eventId);
    } else if (action.type === 'quarantine') {
      quarantinedEvents.push(event.eventId);
    }
  }

  // Generate blacklist updates
  const blacklistUpdates = generateBlacklistUpdates(fraudulentEvents || [], actionConfig);

  // Generate publisher notifications
  const publisherNotifications = generatePublisherNotifications(
    fraudulentEvents || [],
    actionConfig,
  );

  return {
    ...data,
    actionStats: {
      blacklistUpdates: blacklistUpdates.length,
      blocked: blockedEvents.length,
      notifications: publisherNotifications.length,
      quarantined: quarantinedEvents.length,
      totalActions: actions.length,
    },
    blacklistUpdates,
    blockedEvents,
    preventionActions: actions,
    publisherNotifications,
    quarantinedEvents,
  };
});

function generateActionForEvent(event: any, config: any): any {
  let actionType = 'monitor';
  let reason = 'Detected as potentially fraudulent';

  if (event.riskLevel === 'critical') {
    actionType = config.autoBlock ? 'block' : 'quarantine';
    reason = 'Critical fraud score detected';
  } else if (event.riskLevel === 'high') {
    actionType = 'quarantine';
    reason = 'High fraud risk identified';
  } else if (event.riskLevel === 'medium') {
    actionType = 'flag';
    reason = 'Medium fraud risk flagged for review';
  }

  return {
    type: actionType,
    actionId: `action_${event.eventId}`,
    eventId: event.eventId,
    expiresAt:
      actionType === 'quarantine'
        ? new Date(Date.now() + config.quarantineTime * 60 * 60 * 1000).toISOString()
        : undefined,
    fraudScore: event.fraudScore,
    reason,
    recommendedActions: event.recommendations,
    riskLevel: event.riskLevel,
    timestamp: new Date().toISOString(),
  };
}

function generateBlacklistUpdates(fraudulentEvents: any[], config: any): any[] {
  if (!config.updateBlacklists) return [];

  const updates: any[] = [];
  const ipCounts = new Map();
  const deviceCounts = new Map();

  // Count fraudulent activity by IP and device
  fraudulentEvents.forEach((event) => {
    const ip = event.eventId; // Mock - would get from original event
    const device = event.eventId; // Mock - would get from original event

    ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
  });

  // Add high-frequency IPs to blacklist
  ipCounts.forEach((count, ip) => {
    if (count >= 5) {
      updates.push({
        confidence: Math.min(count / 10, 1),
        type: 'ip_blacklist',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: `${count} fraudulent events detected`,
        value: ip,
      });
    }
  });

  // Add suspicious devices to blacklist
  deviceCounts.forEach((count, device) => {
    if (count >= 3) {
      updates.push({
        confidence: Math.min(count / 5, 1),
        type: 'device_blacklist',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        reason: `${count} fraudulent events from device`,
        value: device,
      });
    }
  });

  return updates;
}

function generatePublisherNotifications(fraudulentEvents: any[], config: any): any[] {
  if (!config.publisherNotification) return [];

  const publisherStats = new Map();

  fraudulentEvents.forEach((event) => {
    // Mock publisher extraction
    const publisherId = `pub_${Math.floor(Math.random() * 200)}`;

    if (!publisherStats.has(publisherId)) {
      publisherStats.set(publisherId, {
        events: [],
        fraudCount: 0,
        totalFraudScore: 0,
      });
    }

    const stats = publisherStats.get(publisherId);
    stats.fraudCount++;
    stats.totalFraudScore += event.fraudScore;
    stats.events.push(event.eventId);
  });

  const notifications: any[] = [];
  publisherStats.forEach((stats, publisherId) => {
    if (stats.fraudCount >= 10) {
      notifications.push({
        type: 'fraud_alert',
        action: 'review_traffic_quality',
        averageFraudScore: stats.totalFraudScore / stats.fraudCount,
        fraudCount: stats.fraudCount,
        message: `${stats.fraudCount} fraudulent events detected from your traffic`,
        publisherId,
        severity: stats.fraudCount > 50 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return notifications;
}

// Step 6: Update fraud models
export const updateFraudModelsStep = createStep('update-models', async (data: any) => {
  const { fraudulentEvents, highRiskEvents, mlConfig } = data;

  if (!mlConfig.continuousLearning) {
    return {
      ...data,
      modelUpdateSkipped: true,
    };
  }

  // Simulate model updates with new fraud patterns
  const modelUpdates = [];

  // Extract new patterns from detected fraud
  const newPatterns = extractFraudPatterns(fraudulentEvents || []);

  // Update each model type
  for (const modelType of mlConfig.modelTypes) {
    const update = await updateFraudModel(modelType, newPatterns);
    modelUpdates.push(update);
  }

  return {
    ...data,
    modelsUpdated: true,
    modelUpdates,
    newPatternsLearned: newPatterns.length,
  };
});

function extractFraudPatterns(fraudulentEvents: any[]): any[] {
  const patterns: any[] = [];

  // Extract common fraud indicators
  const fraudTypes = new Map();

  fraudulentEvents.forEach((event) => {
    event.fraudTypes?.forEach((type: any) => {
      fraudTypes.set(type, (fraudTypes.get(type) || 0) + 1);
    });
  });

  // Convert to patterns
  fraudTypes.forEach((count, type) => {
    if (count >= 5) {
      patterns.push({
        confidence: Math.min(count / 20, 1),
        type: 'fraud_signature',
        fraudType: type,
        frequency: count,
        indicators: fraudulentEvents
          .filter((e) => e.fraudTypes?.includes(type))
          .flatMap((e) => e.indicators)
          .slice(0, 10),
      });
    }
  });

  return patterns;
}

async function updateFraudModel(modelType: string, patterns: any[]): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    improvementScore: Math.random() * 0.1 + 0.02, // 2-12% improvement
    modelType,
    patternsIntegrated: patterns.length,
    status: 'updated',
    updateTimestamp: new Date().toISOString(),
    version: `v${Date.now()}`,
  };
}

// Step 7: Generate fraud detection report
export const generateFraudDetectionReportStep = createStep('generate-report', async (data: any) => {
  const {
    actionStats,
    behavioralAnalysis,
    fraudulentEvents,
    highRiskEvents,
    mlDetectionStats,
    statisticalAnomalies,
    totalEvents,
  } = data;

  const report = {
    analysisScope: data.analysisScope,
    detection: {
      behavioralFlags: behavioralAnalysis?.suspiciousBehaviorFlags?.length || 0,
      mlResults: mlDetectionStats,
      statisticalAnomalies: statisticalAnomalies?.length || 0,
    },
    fraudTypes: analyzeFraudTypes(fraudulentEvents || []),
    performance: {
      detectionAccuracy: calculateDetectionAccuracy(data),
      falsePositiveRate: estimateFalsePositiveRate(data),
      processingTime: calculateProcessingTime(data),
    },
    prevention: {
      blacklistUpdates: actionStats?.blacklistUpdates || 0,
      blockedEvents: actionStats?.blocked || 0,
      publisherNotifications: actionStats?.notifications || 0,
      quarantinedEvents: actionStats?.quarantined || 0,
    },
    recommendations: generateFraudRecommendations(data),
    reportId: `fraud_detection_${Date.now()}`,
    summary: {
      actionsGenerated: actionStats?.totalActions || 0,
      averageFraudScore: mlDetectionStats?.averageFraudScore || 0,
      eventsAnalyzed: totalEvents,
      fraudDetected: fraudulentEvents?.length || 0,
      fraudRate: ((fraudulentEvents?.length || 0) / totalEvents) * 100,
      highRiskEvents: highRiskEvents?.length || 0,
    },
    timestamp: new Date().toISOString(),
    topThreats: identifyTopThreats(fraudulentEvents || []),
  };

  return {
    ...data,
    fraudDetectionComplete: true,
    report,
  };
});

function analyzeFraudTypes(fraudulentEvents: any[]): any {
  const typeCounts = new Map();

  fraudulentEvents.forEach((event) => {
    event.fraudTypes?.forEach((type: any) => {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });
  });

  const distribution = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: (count / fraudulentEvents.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    distribution,
    mostCommon: distribution[0]?.type,
    uniqueTypes: distribution.length,
  };
}

function identifyTopThreats(fraudulentEvents: any[]): any[] {
  // Group by IP, device, publisher to identify top threats
  const threats = new Map();

  fraudulentEvents.forEach((event) => {
    // Mock threat identification
    const threatId = `threat_${Math.floor(Math.random() * 50)}`;

    if (!threats.has(threatId)) {
      threats.set(threatId, {
        id: threatId,
        type: 'ip_cluster',
        eventCount: 0,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        totalFraudScore: 0,
      });
    }

    const threat = threats.get(threatId);
    threat.eventCount++;
    threat.totalFraudScore += event.fraudScore;
    threat.lastSeen = event.timestamp;
  });

  return Array.from(threats.values())
    .map((threat) => ({
      ...threat,
      averageFraudScore: threat.totalFraudScore / threat.eventCount,
      riskLevel: threat.eventCount > 20 ? 'high' : threat.eventCount > 10 ? 'medium' : 'low',
    }))
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 10);
}

function generateFraudRecommendations(data: any): any[] {
  const recommendations = [];

  // High fraud rate
  const fraudRate = ((data.fraudulentEvents?.length || 0) / data.totalEvents) * 100;
  if (fraudRate > 5) {
    recommendations.push({
      action: 'tighten_detection_parameters',
      category: 'fraud_rate',
      description: `Fraud rate of ${fraudRate.toFixed(1)}% exceeds normal thresholds`,
      expectedImpact: 'Reduce fraud rate by 30-50%',
      priority: 'high',
      title: 'High Fraud Rate Detected',
    });
  }

  // Bot traffic
  if (data.behavioralAnalysis?.deviceFingerprintClusters?.deviceFarmIndicators > 5) {
    recommendations.push({
      action: 'implement_advanced_bot_detection',
      category: 'bot_traffic',
      description: 'Multiple device farm indicators suggest coordinated bot activity',
      expectedImpact: 'Reduce bot traffic by 60-80%',
      priority: 'high',
      title: 'Device Farm Activity Detected',
    });
  }

  // Geographic anomalies
  if (data.statisticalAnalysis?.geographicDistribution?.concentrationRatio > 80) {
    recommendations.push({
      action: 'implement_geographic_filtering',
      category: 'geographic',
      description: 'High concentration of traffic from specific regions',
      expectedImpact: 'Improve traffic quality and reduce fraud',
      priority: 'medium',
      title: 'Geographic Traffic Concentration',
    });
  }

  // Model performance
  if (data.mlDetectionStats?.averageFraudScore < 30) {
    recommendations.push({
      action: 'retrain_detection_models',
      category: 'model_performance',
      description: 'ML models may need retraining with recent fraud patterns',
      expectedImpact: 'Improve detection accuracy by 15-25%',
      priority: 'medium',
      title: 'Low Average Fraud Scores',
    });
  }

  return recommendations;
}

function calculateDetectionAccuracy(data: any): number {
  // Mock accuracy calculation
  return 0.85 + Math.random() * 0.1; // 85-95%
}

function estimateFalsePositiveRate(data: any): number {
  // Mock false positive estimation
  return Math.random() * 0.05; // 0-5%
}

function calculateProcessingTime(data: any): any {
  return {
    averageEventProcessingTime: 10 + Math.random() * 20, // 10-30ms per event
    mlModelLatency: 15 + Math.random() * 10, // 15-25ms
    statisticalAnalysisTime: 5000 + Math.random() * 5000, // 5-10 seconds
    totalProcessingTime: 120000 + Math.random() * 60000, // 2-3 minutes
  };
}

// Main workflow definition
export const clickFraudDetectionPreventionWorkflow = {
  id: 'click-fraud-detection-prevention',
  name: 'Click Fraud Detection & Prevention',
  config: {
    concurrency: {
      max: 6, // Limit concurrent fraud detection jobs
    },
    maxDuration: 1800000, // 30 minutes
    schedule: {
      cron: '*/30 * * * *', // Every 30 minutes
      timezone: 'UTC',
    },
  },
  description:
    'Detect and prevent fraudulent clicks, impressions, and conversions using ML and behavioral analysis',
  features: {
    automatedPrevention: true,
    behavioralAnalysis: true,
    continuousLearning: true,
    machineLearningModels: true,
    realTimeFraudDetection: true,
  },
  steps: [
    collectClickEventsStep,
    performStatisticalAnalysisStep,
    runMLFraudDetectionStep,
    analyzeBehavioralPatternsStep,
    generatePreventionActionsStep,
    updateFraudModelsStep,
    generateFraudDetectionReportStep,
  ],
  version: '1.0.0',
};
