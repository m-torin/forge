import React from 'react';

// Make React available globally for JSX
global.React = React;

// Setup email environment variables for testing
process.env.RESEND_TOKEN = 'test-resend-token';
process.env.RESEND_FROM_EMAIL = 'test@example.com';

// Centralized mocks include Resend and React Email
