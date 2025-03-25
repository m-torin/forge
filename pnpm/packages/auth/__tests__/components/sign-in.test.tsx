import { describe, expect, it } from 'vitest';
import React from 'react';
import { createRender, screen } from '../setup';
import { SignIn } from '../../components/sign-in';

// Create a custom render function that can be extended with providers if needed
const customRender = createRender();

describe('SignIn Component', () => {
  it('renders the Clerk SignIn component', () => {
    customRender(React.createElement(SignIn));

    // The ClerkSignIn component is mocked in setup.ts to render a div with data-testid="clerk-sign-in"
    expect(screen.getByTestId('clerk-sign-in')).toBeDefined();
  });
});
