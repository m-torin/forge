/**
 * Coupon-related ecommerce events
 */

import { ECOMMERCE_EVENTS, type CouponProperties, type EcommerceEventSpec } from '../types';
import { cleanProperties, validateRequiredProperties } from '../utils';

/**
 * Track when a coupon is successfully applied
 */
export function couponApplied(properties: CouponProperties): EcommerceEventSpec<CouponProperties> {
  const normalizedProps: CouponProperties = {
    order_id: properties.order_id,
    cart_id: properties.cart_id,
    coupon_id: properties.coupon_id,
    coupon_name: properties.coupon_name,
    discount: properties.discount,
  };

  return {
    name: ECOMMERCE_EVENTS.COUPON_APPLIED,
    category: 'ecommerce',
    requiredProperties: [],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a coupon is removed
 */
export function couponRemoved(properties: CouponProperties): EcommerceEventSpec<CouponProperties> {
  const normalizedProps: CouponProperties = {
    order_id: properties.order_id,
    cart_id: properties.cart_id,
    coupon_id: properties.coupon_id,
    coupon_name: properties.coupon_name,
    discount: properties.discount,
  };

  return {
    name: ECOMMERCE_EVENTS.COUPON_REMOVED,
    category: 'ecommerce',
    requiredProperties: [],
    properties: cleanProperties(normalizedProps),
  };
}