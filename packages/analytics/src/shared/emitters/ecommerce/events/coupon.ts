/**
 * Coupon-related ecommerce events
 */

import { type CouponProperties, ECOMMERCE_EVENTS, type EcommerceEventSpec } from '../types';
import { cleanProperties } from '../utils';

/**
 * Track when a coupon is successfully applied
 */
export function couponApplied(properties: CouponProperties): EcommerceEventSpec<CouponProperties> {
  const normalizedProps: CouponProperties = {
    cart_id: properties.cart_id,
    coupon_id: properties.coupon_id,
    order_id: properties.order_id,
    coupon_name: properties.coupon_name,
    discount: properties.discount,
    reason: properties.reason,
  };

  return {
    name: ECOMMERCE_EVENTS.COUPON_APPLIED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: [],
  };
}

/**
 * Track when a coupon is removed
 */
export function couponRemoved(properties: CouponProperties): EcommerceEventSpec<CouponProperties> {
  const normalizedProps: CouponProperties = {
    cart_id: properties.cart_id,
    coupon_id: properties.coupon_id,
    order_id: properties.order_id,
    coupon_name: properties.coupon_name,
    discount: properties.discount,
    reason: properties.reason,
  };

  return {
    name: ECOMMERCE_EVENTS.COUPON_REMOVED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: [],
  };
}
