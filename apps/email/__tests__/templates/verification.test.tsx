import { VerificationTemplate } from '@repo/email/templates/verification';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('VerificationTemplate', () => {
  const defaultProps = {
    email: 'test@example.com',
    verificationLink: 'https://example.com/verify?token=abc123',
  };

  it('should render with required props', () => {
    const { container } = render(<VerificationTemplate {...defaultProps} />);

    // Check for key elements
    expect(container.textContent).toContain('Verify your email address');
    expect(container.textContent).toContain('test@example.com');
    expect(
      container.querySelector('a[href="https://example.com/verify?token=abc123"]'),
    ).toBeTruthy();
  });

  it('should render with name prop', () => {
    const { container } = render(<VerificationTemplate {...defaultProps} name="John Doe" />);

    expect(container.textContent).toContain('Hi John Doe!');
  });

  it('should fallback to email when name is not provided', () => {
    const { container } = render(<VerificationTemplate {...defaultProps} />);

    expect(container.textContent).toContain('Hi test@example.com!');
  });

  it('should render verification button with correct link', () => {
    const { container } = render(<VerificationTemplate {...defaultProps} />);

    const button = container.querySelector('a[href="https://example.com/verify?token=abc123"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Verify Email Address');
  });

  it('should include security notice', () => {
    const { container } = render(<VerificationTemplate {...defaultProps} />);

    expect(container.textContent).toContain('This link will expire in 24 hours for your security.');
    expect(container.textContent).toContain(
      "If you didn't create an account, you can safely ignore this email.",
    );
  });
});
