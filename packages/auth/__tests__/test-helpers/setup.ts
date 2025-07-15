/**
 * Consolidated test setup for auth package
 * Replaces the duplicated setup.ts and server/setup.ts files
 */

import '@testing-library/jest-dom';
import React from 'react';
import { setupAllMocks } from './mocks';

// Set up all mocks at once
setupAllMocks();

// Ensure React is available globally for JSX
global.React = React;

// Additional auth-specific test configuration
process.env.AUTH_TEST_ISOLATION = 'true';
process.env.MOCK_EXTERNAL_AUTH_PROVIDERS = 'true';
