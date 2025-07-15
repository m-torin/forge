import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX
(globalThis as any).React = React;

// Setup notifications environment manually (inline to avoid import issues)
const notificationsEnv = {
  NODE_ENV: 'test',
  CI: 'true',
  SKIP_ENV_VALIDATION: 'true',
  KNOCK_API_KEY: 'sk_test_1234567890',
  KNOCK_PUBLIC_API_KEY: 'pk_test_1234567890',
  NOTIFICATION_WEBHOOK_SECRET: 'whsec_test_1234567890',
};

Object.entries(notificationsEnv).forEach(([key, value]) => {
  process.env[key] = value;
});

// Centralized mocks include Mantine notifications and Knock
