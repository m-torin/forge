/**
 * Event format conversion utilities for 3rd party analytics integrations
 */

import type { AnalyticsEvent, EcommerceEvent, IdentifyPayload } from '../types';

export interface ProviderEventFormat {
  posthog: any;
  segment: any;
  vercel: any;
  ga4: any;
  mixpanel: any;
  amplitude: any;
}

export class EventConverter {
  static toPostHog(event: AnalyticsEvent): any {
    return {
      event: event.name,
      properties: {
        ...event.properties,
        $current_url: event.context?.page?.url,
        $pathname: event.context?.page?.path,
        $referrer: event.context?.page?.referrer,
        $title: event.context?.page?.title,
        $user_id: event.userId,
        $device_type: event.context?.device?.type,
        $browser: event.context?.device?.userAgent,
        $ip: event.context?.device?.ip,
      },
      timestamp: event.timestamp,
      distinct_id: event.userId || event.anonymousId,
    };
  }

  static toSegment(event: AnalyticsEvent): any {
    return {
      type: 'track',
      event: event.name,
      userId: event.userId,
      anonymousId: event.anonymousId,
      properties: event.properties,
      context: {
        page: event.context?.page,
        userAgent: event.context?.device?.userAgent,
        ip: event.context?.device?.ip,
        locale: event.context?.device?.locale,
        campaign: event.context?.campaign,
      },
      timestamp: event.timestamp,
    };
  }

  static toVercel(event: AnalyticsEvent): any {
    return {
      name: event.name,
      data: event.properties || {},
      timestamp: event.timestamp,
    };
  }

  static toGA4(event: AnalyticsEvent): any {
    // GA4 uses gtag format
    return {
      event_name: this.normalizeGA4EventName(event.name),
      parameters: {
        ...event.properties,
        user_id: event.userId,
        session_id: event.context?.session?.id,
        page_location: event.context?.page?.url,
        page_title: event.context?.page?.title,
        page_referrer: event.context?.page?.referrer,
      },
      timestamp_micros: event.timestamp ? new Date(event.timestamp).getTime() * 1000 : undefined,
    };
  }

  static toMixpanel(event: AnalyticsEvent): any {
    return {
      event: event.name,
      properties: {
        ...event.properties,
        distinct_id: event.userId || event.anonymousId,
        $current_url: event.context?.page?.url,
        $referrer: event.context?.page?.referrer,
        $browser: event.context?.device?.userAgent,
        $device: event.context?.device?.type,
        $ip: event.context?.device?.ip,
        time: event.timestamp ? Math.floor(new Date(event.timestamp).getTime() / 1000) : undefined,
      },
    };
  }

  static toAmplitude(event: AnalyticsEvent): any {
    return {
      event_type: event.name,
      user_id: event.userId,
      device_id: event.anonymousId,
      event_properties: event.properties || {},
      user_properties: event.context?.user?.traits || {},
      time: event.timestamp ? new Date(event.timestamp).getTime() : undefined,
      session_id: event.context?.session?.id,
      platform: event.context?.device?.type || 'Web',
    };
  }

  private static normalizeGA4EventName(eventName: string): string {
    // GA4 event names must be alphanumeric with underscores
    return eventName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }
}

export class IdentifyConverter {
  static toPostHog(payload: IdentifyPayload): any {
    return {
      distinct_id: payload.userId,
      $set: payload.traits || {},
      $ip: payload.context?.device?.ip,
    };
  }

  static toSegment(payload: IdentifyPayload): any {
    return {
      type: 'identify',
      userId: payload.userId,
      traits: payload.traits || {},
      context: {
        userAgent: payload.context?.device?.userAgent,
        ip: payload.context?.device?.ip,
        locale: payload.context?.device?.locale,
      },
    };
  }

  static toMixpanel(payload: IdentifyPayload): any {
    return {
      $distinct_id: payload.userId,
      $set: payload.traits || {},
    };
  }

  static toAmplitude(payload: IdentifyPayload): any {
    return {
      user_id: payload.userId,
      user_properties: payload.traits || {},
    };
  }
}

export class EcommerceConverter {
  static convertProductViewed(event: EcommerceEvent): Record<string, any> {
    const product = event.product!;

    return {
      posthog: {
        event: 'Product Viewed',
        properties: {
          $product_name: product.name,
          $product_id: product.id,
          $product_category: product.category,
          $product_brand: product.brand,
          $product_price: product.price,
          $product_currency: product.currency,
          $product_variant: product.variant,
          $product_sku: product.sku,
        },
      },
      segment: {
        event: 'Product Viewed',
        properties: {
          product_id: product.id,
          name: product.name,
          category: product.category,
          brand: product.brand,
          variant: product.variant,
          price: product.price,
          currency: product.currency,
          sku: product.sku,
        },
      },
      ga4: {
        event_name: 'view_item',
        parameters: {
          currency: product.currency || 'USD',
          value: product.price,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              item_category: product.category,
              item_brand: product.brand,
              item_variant: product.variant,
              price: product.price,
              quantity: 1,
            },
          ],
        },
      },
      mixpanel: {
        event: 'Product Viewed',
        properties: {
          'Product ID': product.id,
          'Product Name': product.name,
          'Product Category': product.category,
          'Product Brand': product.brand,
          'Product Price': product.price,
          'Product Currency': product.currency,
        },
      },
    };
  }

  static convertProductAdded(event: EcommerceEvent): Record<string, any> {
    const product = event.product!;
    const quantity = product.quantity || 1;

    return {
      posthog: {
        event: 'Product Added to Cart',
        properties: {
          $product_name: product.name,
          $product_id: product.id,
          $product_price: product.price,
          $product_quantity: quantity,
          $product_total: product.price * quantity,
        },
      },
      ga4: {
        event_name: 'add_to_cart',
        parameters: {
          currency: product.currency || 'USD',
          value: product.price * quantity,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              item_category: product.category,
              price: product.price,
              quantity: quantity,
            },
          ],
        },
      },
    };
  }

  static convertOrderCompleted(event: EcommerceEvent): Record<string, any> {
    const order = event.order!;

    return {
      posthog: {
        event: 'Order Completed',
        properties: {
          $order_id: order.id,
          $order_total: order.total,
          $order_currency: order.currency,
          $order_items_count: order.items.length,
          $order_shipping: order.shipping || 0,
          $order_tax: order.tax || 0,
          $order_discount: order.discount || 0,
        },
      },
      ga4: {
        event_name: 'purchase',
        parameters: {
          transaction_id: order.id,
          currency: order.currency,
          value: order.total,
          tax: order.tax || 0,
          shipping: order.shipping || 0,
          coupon: order.coupon,
          items: order.items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      segment: {
        event: 'Order Completed',
        properties: {
          order_id: order.id,
          total: order.total,
          revenue: order.total,
          currency: order.currency,
          products: order.items.map(item => ({
            product_id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    };
  }
}

export function convertEvent(event: AnalyticsEvent, targetProvider: string): any {
  switch (targetProvider) {
    case 'posthog':
      return EventConverter.toPostHog(event);
    case 'segment':
      return EventConverter.toSegment(event);
    case 'vercel':
      return EventConverter.toVercel(event);
    case 'ga4':
      return EventConverter.toGA4(event);
    case 'mixpanel':
      return EventConverter.toMixpanel(event);
    case 'amplitude':
      return EventConverter.toAmplitude(event);
    default:
      return event;
  }
}

export function convertIdentify(payload: IdentifyPayload, targetProvider: string): any {
  switch (targetProvider) {
    case 'posthog':
      return IdentifyConverter.toPostHog(payload);
    case 'segment':
      return IdentifyConverter.toSegment(payload);
    case 'mixpanel':
      return IdentifyConverter.toMixpanel(payload);
    case 'amplitude':
      return IdentifyConverter.toAmplitude(payload);
    default:
      return payload;
  }
}
