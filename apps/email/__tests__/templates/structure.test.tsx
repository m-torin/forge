import { ContactTemplate } from '@repo/email/templates/contact';
import { PasswordResetTemplate } from '@repo/email/templates/password-reset';
import { VerificationTemplate } from '@repo/email/templates/verification';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Email Template Structure', () => {
  it('should render without errors', () => {
    const { container } = render(
      <VerificationTemplate
        email="test@example.com"
        verificationLink="https://example.com/verify"
      />,
    );

    // Basic check that component renders
    expect(container).toBeTruthy();
    expect(container.textContent).toBeTruthy();
  });

  it('should have preview text', () => {
    const { container } = render(
      <VerificationTemplate
        email="test@example.com"
        verificationLink="https://example.com/verify"
      />,
    );

    expect(container.textContent).toContain('Verify your email address');
  });

  it('should have clickable links', () => {
    const { container } = render(
      <PasswordResetTemplate email="test@example.com" resetLink="https://example.com/reset" />,
    );

    const button = container.querySelector('a[href="https://example.com/reset"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Reset Password');
  });

  it('should have consistent content structure', () => {
    const { container } = render(
      <ContactTemplate email="test@example.com" name="John Doe" message="Test message" />,
    );

    // Check that content is rendered
    expect(container.textContent).toContain('New email from John Doe');
    expect(container.textContent).toContain('test@example.com');
    expect(container.textContent).toContain('Test message');
  });

  it('should handle different template types', () => {
    const templates = [
      <VerificationTemplate
        key="verification"
        email="test@example.com"
        verificationLink="https://example.com/verify"
      />,
      <PasswordResetTemplate
        key="reset"
        email="test@example.com"
        resetLink="https://example.com/reset"
      />,
      <ContactTemplate
        key="contact"
        email="test@example.com"
        name="John Doe"
        message="Test message"
      />,
    ];

    templates.forEach(template => {
      const { container } = render(template);
      expect(container.textContent).toBeTruthy();
      expect(container.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('should have proper text content', () => {
    const { container } = render(
      <ContactTemplate email="test@example.com" name="John Doe" message="Test message" />,
    );

    // Check for key content elements
    expect(container.textContent).toContain('New email from John Doe');
    expect(container.textContent).toContain('John Doe (test@example.com) has sent you a message:');
    expect(container.textContent).toContain('Test message');
  });
});
