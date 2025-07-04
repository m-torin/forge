import { logger } from '@/lib/logger';
import { get } from '@vercel/edge-config';

import { MaintenancePage } from './MaintenancePageUi';
import { SplashPage } from './SplashPageUi';
import { RedirectToHome } from './RedirectToHome';

type SplashType = 'default' | 'maintenance';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // SPLASH PAGE DISABLED - Redirect to home page
  // Check Edge Config to determine which splash type to show
  // let splashType: SplashType = 'default';

  // try {
  //   // @vercel/edge-config will return null if not configured
  //   const configSplashType = await get('splashType');
  //   const isInMaintenanceMode = await get('isInMaintenanceMode');

  //   // Backward compatibility: check for old isInMaintenanceMode flag
  //   if (isInMaintenanceMode) {
  //     splashType = 'maintenance';
  //   } else if (configSplashType && typeof configSplashType === 'string') {
  //     splashType = configSplashType as SplashType;
  //   }
  // } catch (_error: any) {
  //   // If Edge Config is not available, default to splash page
  //   logger.info('Edge Config not available, defaulting to splash page');
  // }

  // // Render based on splash type
  // switch (splashType) {
  //   case 'maintenance':
  //     return <MaintenancePage locale={locale} />;

  //   case 'default':
  //   default:
  //     return <SplashPage locale={locale} />;
  // }

  // Redirect to home page instead of showing splash
  return <RedirectToHome locale={locale} />;
}
