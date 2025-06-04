'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics-setup';

interface PageViewTrackerProps {
  userId?: string;
  locale?: string;
}

export function PageViewTracker({ userId, locale }: PageViewTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Parse the pathname to extract meaningful page info
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove locale from segments if present
    const pathSegments = segments[0] === locale ? segments.slice(1) : segments;
    
    // Determine category and name from path
    let category = pathSegments[0] || 'home';
    let name = pathSegments[pathSegments.length - 1] || 'home';
    
    // Handle special cases
    if (pathSegments.length === 0) {
      category = 'home';
      name = 'landing';
    } else if (pathSegments[0] === 'products' && pathSegments[1]) {
      category = 'product';
      name = pathSegments[1]; // product handle
    } else if (pathSegments[0] === 'brands' && pathSegments[1]) {
      category = 'brand';
      name = pathSegments[1]; // brand slug
    }

    // Use the page method (one of the 6 emitters)
    analytics.page(category, name, {
      path: pathname,
      url: window.location.href,
      search: window.location.search,
      title: document.title,
      referrer: document.referrer,
      locale: locale,
      userId: userId,
    }).catch(error => {
      console.error('Failed to track page view:', error);
    });
  }, [pathname, userId, locale]);

  return null;
}