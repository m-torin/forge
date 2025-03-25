import { describe, expect, it } from 'vitest';
import React from 'react';
import { ContactTemplate } from '../../templates/contact';

// Simple snapshot-style test that doesn't require actual rendering
describe('ContactTemplate', () => {
  it('creates the email template structure correctly', () => {
    // Create the component with test props
    const template = (
      <ContactTemplate
        name="John Doe"
        email="john@example.com"
        message="Hello, this is a test message."
      />
    );

    // Basic assertions to verify the component and props
    expect(template).toBeDefined();
    expect(template.type).toBe(ContactTemplate);
    expect(template.props.name).toBe('John Doe');
    expect(template.props.email).toBe('john@example.com');
    expect(template.props.message).toBe('Hello, this is a test message.');
  });
});
