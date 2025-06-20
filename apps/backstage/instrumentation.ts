/**
 * Next.js instrumentation for Backstage app
 * Uses the observability package for Sentry integration
 */

// Export register and onRequestError from the observability package
// This maintains the four-file export pattern - server-only code
export { register, onRequestError } from '@repo/observability/server/next';

// Optional: If you need custom configuration, you can wrap the register function
// export async function register() {
//   const { register: observabilityRegister } = await import('@repo/observability/server/next');
//
//   // Pass custom config if needed
//   await observabilityRegister({
//     providers: {
//       sentry: {
//         dsn: process.env.SENTRY_DSN,
//         environment: process.env.NODE_ENV,
//         // Add backstage-specific tags
//         options: {
//           beforeSend: (event) => {
//             event.tags = { ...event.tags, app: 'backstage' };
//             return event;
//           }
//         }
//       }
//     }
//   });
// }
