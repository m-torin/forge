import { ContactTemplate } from '@repo/email/templates/contact';
import { PasswordResetTemplate } from '@repo/email/templates/password-reset';
import { VerificationTemplate } from '@repo/email/templates/verification';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Email Template Props Validation', () => {
  describe('VerificationTemplate', () => {
    it('should handle null name prop', () => {
      const { container } = render(
        <VerificationTemplate
          email="test@example.com"
          verificationLink="https://example.com/verify"
          name={null}
        />,
      );

      expect(container.textContent).toContain('Hi test@example.com!');
    });

    it('should handle undefined name prop', () => {
      const { container } = render(
        <VerificationTemplate
          email="test@example.com"
          verificationLink="https://example.com/verify"
          name={undefined}
        />,
      );

      expect(container.textContent).toContain('Hi test@example.com!');
    });

    it('should handle empty string name prop', () => {
      const { container } = render(
        <VerificationTemplate
          email="test@example.com"
          verificationLink="https://example.com/verify"
          name=""
        />,
      );

      expect(container.textContent).toContain('Hi !');
    });
  });

  describe('PasswordResetTemplate', () => {
    it('should handle null name prop', () => {
      const { container } = render(
        <PasswordResetTemplate
          email="test@example.com"
          resetLink="https://example.com/reset"
          name={null}
        />,
      );

      expect(container.textContent).toContain('Hi test@example.com!');
    });

    it('should handle special characters in email', () => {
      const { container } = render(
        <PasswordResetTemplate
          email="test+tag@example.com"
          resetLink="https://example.com/reset"
        />,
      );

      expect(container.textContent).toContain('test+tag@example.com');
    });
  });

  describe('ContactTemplate', () => {
    it('should handle special characters in name', () => {
      const { container } = render(
        <ContactTemplate email="test@example.com" name="John O'Connor" message="Test message" />,
      );

      expect(container.textContent).toContain("John O'Connor");
    });

    it('should handle special characters in email', () => {
      const { container } = render(
        <ContactTemplate email="test+tag@example.com" name="John Doe" message="Test message" />,
      );

      expect(container.textContent).toContain('test+tag@example.com');
    });

    it('should handle HTML in message', () => {
      const { container } = render(
        <ContactTemplate
          email="test@example.com"
          name="John Doe"
          message="Message with <strong>bold</strong> text"
        />,
      );

      expect(container.textContent).toContain('Message with <strong>bold</strong> text');
    });
  });

  describe('URL Validation', () => {
    it('should handle relative URLs', () => {
      const { container } = render(
        <VerificationTemplate email="test@example.com" verificationLink="/verify?token=abc123" />,
      );

      expect(container.querySelector('a[href="/verify?token=abc123"]')).toBeTruthy();
    });

    it('should handle URLs with query parameters', () => {
      const { container } = render(
        <PasswordResetTemplate
          email="test@example.com"
          resetLink="https://example.com/reset?token=abc123&redirect=/dashboard"
        />,
      );

      expect(
        container.querySelector(
          'a[href="https://example.com/reset?token=abc123&redirect=/dashboard"]',
        ),
      ).toBeTruthy();
    });
  });
});
