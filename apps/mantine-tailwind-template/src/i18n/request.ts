/**
 * Request configuration for next-intl
 * This file is automatically imported by the next-intl plugin
 */

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // Use the package's request configuration
  const packageConfig = await import('@repo/internationalization/request');
  return packageConfig.default({ requestLocale });
});
