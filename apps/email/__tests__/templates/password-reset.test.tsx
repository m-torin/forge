import { PasswordResetTemplate } from '@repo/email/templates/password-reset';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PasswordResetTemplate', () => {
  const defaultProps = {
    email: 'test@example.com',
    resetLink: 'https://example.com/reset?token=abc123',
  };

  it('should render with required props', () => {
    const { container } = render(<PasswordResetTemplate {...defaultProps} />);

    expect(container.textContent).toContain('Reset your password');
    expect(container.textContent).toContain('test@example.com');
    expect(
      container.querySelector('a[href="https://example.com/reset?token=abc123"]'),
    ).toBeTruthy();
  });

  it('should render with name prop', () => {
    const { container } = render(<PasswordResetTemplate {...defaultProps} name="John Doe" />);

    expect(container.textContent).toContain('Hi John Doe!');
  });

  it('should fallback to email when name is not provided', () => {
    const { container } = render(<PasswordResetTemplate {...defaultProps} />);

    expect(container.textContent).toContain('Hi test@example.com!');
  });

  it('should render reset button with correct link', () => {
    const { container } = render(<PasswordResetTemplate {...defaultProps} />);

    const button = container.querySelector('a[href="https://example.com/reset?token=abc123"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Reset Password');
  });

  it('should include security notice', () => {
    const { container } = render(<PasswordResetTemplate {...defaultProps} />);

    expect(container.textContent).toContain('This link will expire in 1 hour for your security.');
    expect(container.textContent).toContain(
      "If you didn't request this password reset, you can safely ignore this email.",
    );
  });
});
