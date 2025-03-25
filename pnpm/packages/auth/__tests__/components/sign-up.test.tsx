import { describe, expect, it } from 'vitest';
import React from 'react';
import { createRender, screen } from '../setup';
import { SignUp } from '../../components/sign-up';

// Create a custom render function that can be extended with providers if needed
const customRender = createRender();

describe('SignUp Component', () => {
  it('renders the Clerk SignUp component', () => {
    customRender(React.createElement(SignUp));

    // The ClerkSignUp component is mocked in setup.ts to render a div with data-testid="clerk-sign-up"
    expect(screen.getByTestId('clerk-sign-up')).toBeDefined();
  });
});
