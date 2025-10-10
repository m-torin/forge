/**
 * Marketing & Campaign Tracking Operations
 * Standard operations for marketing attribution and campaign tracking
 */

import type { AnalyticsEvent } from '../types';

export interface CampaignEvent extends AnalyticsEvent {
  properties: {
    campaign_id?: string;
    campaign_name?: string;
    source: string;
    medium: string;
    content?: string;
    term?: string;
    gclid?: string;
    fbclid?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

export interface AttributionEvent extends AnalyticsEvent {
  properties: {
    attribution_model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
    touchpoints: Array<{
      source: string;
      medium: string;
      campaign?: string;
      timestamp: string;
      weight?: number;
    }>;
    conversion_value?: number;
    conversion_currency?: string;
  };
}

export interface EmailEvent extends AnalyticsEvent {
  name:
    | 'email_sent'
    | 'email_delivered'
    | 'email_opened'
    | 'email_clicked'
    | 'email_bounced'
    | 'email_unsubscribed';
  properties: {
    email_id?: string;
    campaign_id?: string;
    template_id?: string;
    subject?: string;
    recipient?: string;
    link_url?: string;
    bounce_reason?: string;
    unsubscribe_reason?: string;
  };
}

export interface SocialEvent extends AnalyticsEvent {
  name: 'social_share' | 'social_click' | 'social_follow' | 'social_like';
  properties: {
    network: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest';
    content_type?: string;
    content_id?: string;
    content_title?: string;
  };
}

export interface AdEvent extends AnalyticsEvent {
  name: 'ad_impression' | 'ad_click' | 'ad_conversion';
  properties: {
    ad_id?: string;
    ad_name?: string;
    ad_group?: string;
    campaign_id?: string;
    placement?: string;
    creative?: string;
    cost?: number;
    currency?: string;
  };
}

// Campaign tracking functions
export function createCampaignEvent(
  eventName: string,
  source: string,
  medium: string,
  options: Partial<CampaignEvent['properties']> = {},
): CampaignEvent {
  return {
    name: eventName,
    timestamp: new Date(),
    properties: {
      source,
      medium,
      ...options,
    },
  };
}

export function createUTMEvent(
  eventName: string,
  utmParams: {
    utm_source: string;
    utm_medium: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  },
): CampaignEvent {
  return {
    name: eventName,
    timestamp: new Date(),
    properties: {
      source: utmParams.utm_source,
      medium: utmParams.utm_medium,
      ...utmParams,
    },
  };
}

// Attribution tracking functions
export function createAttributionEvent(
  eventName: string,
  model: AttributionEvent['properties']['attribution_model'],
  touchpoints: AttributionEvent['properties']['touchpoints'],
  conversionValue?: number,
  currency = 'USD',
): AttributionEvent {
  return {
    name: eventName,
    timestamp: new Date(),
    properties: {
      attribution_model: model,
      touchpoints,
      conversion_value: conversionValue,
      conversion_currency: currency,
    },
  };
}

// Email marketing functions
export function createEmailEvent(
  eventType: EmailEvent['name'],
  options: Partial<EmailEvent['properties']> = {},
): EmailEvent {
  return {
    name: eventType,
    timestamp: new Date(),
    properties: {
      ...options,
    },
  };
}

// Social media functions
export function createSocialEvent(
  eventType: SocialEvent['name'],
  network: SocialEvent['properties']['network'],
  options: Partial<Omit<SocialEvent['properties'], 'network'>> = {},
): SocialEvent {
  return {
    name: eventType,
    timestamp: new Date(),
    properties: {
      network,
      ...options,
    },
  };
}

// Advertising functions
export function createAdEvent(
  eventType: AdEvent['name'],
  options: Partial<AdEvent['properties']> = {},
): AdEvent {
  return {
    name: eventType,
    timestamp: new Date(),
    properties: {
      ...options,
    },
  };
}

// Higher-level convenience functions
export function trackCampaignVisit(
  source: string,
  medium: string,
  campaign?: string,
  content?: string,
  term?: string,
): CampaignEvent {
  return createCampaignEvent('campaign_visit', source, medium, {
    campaign_name: campaign,
    utm_campaign: campaign,
    content,
    utm_content: content,
    term,
    utm_term: term,
  });
}

export function trackEmailOpen(
  emailId: string,
  campaignId?: string,
  templateId?: string,
): EmailEvent {
  return createEmailEvent('email_opened', {
    email_id: emailId,
    campaign_id: campaignId,
    template_id: templateId,
  });
}

export function trackEmailClick(emailId: string, linkUrl: string, campaignId?: string): EmailEvent {
  return createEmailEvent('email_clicked', {
    email_id: emailId,
    link_url: linkUrl,
    campaign_id: campaignId,
  });
}

export function trackSocialShare(
  network: SocialEvent['properties']['network'],
  contentType: string,
  contentId?: string,
  contentTitle?: string,
): SocialEvent {
  return createSocialEvent('social_share', network, {
    content_type: contentType,
    content_id: contentId,
    content_title: contentTitle,
  });
}

export function trackAdClick(
  adId: string,
  campaignId?: string,
  cost?: number,
  currency = 'USD',
): AdEvent {
  return createAdEvent('ad_click', {
    ad_id: adId,
    campaign_id: campaignId,
    cost,
    currency,
  });
}

// UTM parameter extraction utilities
export function extractUTMFromURL(url: string): Partial<CampaignEvent['properties']> {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
      gclid: params.get('gclid') || undefined,
      fbclid: params.get('fbclid') || undefined,
    };
  } catch {
    return {};
  }
}

export function extractUTMFromReferrer(referrer?: string): Partial<CampaignEvent['properties']> {
  if (!referrer) return {};
  return extractUTMFromURL(referrer);
}
