export default ({ config }) => {
  return {
    ...config,
    scheme: 'hedwig',
    extra: {
      // Add environment-specific configuration
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3400',
      environment: process.env.NODE_ENV || 'development',
      features: {
        analytics: true,
        notifications: true,
        offlineMode: true,
        haptics: true,
      },
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'your-project-id',
      },
    },
    ios: {
      ...config.ios,
      // iOS-specific configurations
      usesAppleSignIn: false,
      config: {
        ...config.ios?.config,
        usesNonExemptEncryption: false,
      },
      // Enable iOS App Clips if needed
      associatedDomains: [],
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
      url: 'https://u.expo.dev/hedwig-project-id', // Replace with actual project ID
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};