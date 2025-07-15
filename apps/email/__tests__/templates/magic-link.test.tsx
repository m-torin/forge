import { MagicLinkTemplate } from '@repo/email/templates/magic-link';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('MagicLinkTemplate', () => {
  const defaultProps = {
    email: 'test@example.com',
    magicLink: 'https://example.com/magic?token=abc123',
  };

  it('should render with required props', () => {
    const { container } = render(<MagicLinkTemplate {...defaultProps} />);
    expect(container.textContent).toContain('Sign in with Magic Link');
    expect(container.textContent).toContain('test@example.com');
    expect(
      container.querySelector('a[href="https://example.com/magic?token=abc123"]'),
    ).toBeTruthy();
  });

  it('should render with name prop', () => {
    const { container } = render(<MagicLinkTemplate {...defaultProps} name="Jane Doe" />);
    expect(container.textContent).toContain('Hi Jane Doe!');
  });

  it('should fallback to email when name is not provided', () => {
    const { container } = render(<MagicLinkTemplate {...defaultProps} />);
    expect(container.textContent).toContain('Hi test@example.com!');
  });

  it('should render magic link button with correct link', () => {
    const { container } = render(<MagicLinkTemplate {...defaultProps} />);
    const button = container.querySelector('a[href="https://example.com/magic?token=abc123"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Sign in with Magic Link');
  });

  it('should include security notice', () => {
    const { container } = render(<MagicLinkTemplate {...defaultProps} />);
    expect(container.textContent).toMatch(/This link will expire/i);
    expect(container.textContent).toMatch(/If you didn't request this/i);
  });

  it('should handle expiresIn prop', () => {
    const { container } = render(<MagicLinkTemplate {...defaultProps} expiresIn="30 minutes" />);
    expect(container.textContent).toMatch(/30 minutes/);
  });

  it('should handle null/undefined/empty name', () => {
    const { container: c1 } = render(<MagicLinkTemplate {...defaultProps} name={null} />);
    expect(c1.textContent).toContain('Hi test@example.com!');
    const { container: c2 } = render(<MagicLinkTemplate {...defaultProps} name={undefined} />);
    expect(c2.textContent).toContain('Hi test@example.com!');
    const { container: c3 } = render(<MagicLinkTemplate {...defaultProps} name="" />);
    expect(c3.textContent).toContain('Hi !');
  });
});
