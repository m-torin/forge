import { ApiKeyCreatedTemplate } from '@repo/email/templates/api-key-created';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ApiKeyCreatedTemplate', () => {
  const defaultProps = {
    apiKeyId: 'key_abc123',
    apiKeyName: 'Production API Key',
    email: 'user@example.com',
    name: 'John Doe',
  };

  it('should render with required props', () => {
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} />);
    expect(container.textContent).toContain('API Key Created');
    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).toContain('Production API Key');
    expect(container.textContent).toContain('key_abc123');
  });

  it('should render API key creation message', () => {
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} />);
    expect(container.textContent).toMatch(/A new API key has been created/i);
    expect(container.textContent).toMatch(/Production API Key/i);
  });

  it('should render dashboard button with default URL', () => {
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} />);
    const button = container.querySelector('a[href="https://example.com/api-keys"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Manage API Keys');
  });

  it('should render dashboard button with custom URL', () => {
    const { container } = render(
      <ApiKeyCreatedTemplate {...defaultProps} dashboardUrl="https://custom.com/dash" />,
    );
    const button = container.querySelector('a[href="https://custom.com/dash"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Manage API Keys');
  });

  it('should include security notice', () => {
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} />);
    expect(container.textContent).toMatch(/If you didn't create this API key/i);
    expect(container.textContent).toMatch(/contact our support team immediately/i);
  });

  it('should handle special characters in API key name', () => {
    const { container } = render(
      <ApiKeyCreatedTemplate {...defaultProps} apiKeyName="José & María's API Key" />,
    );
    expect(container.textContent).toContain("José & María's API Key");
  });

  it('should handle special characters in API key ID', () => {
    const { container } = render(
      <ApiKeyCreatedTemplate {...defaultProps} apiKeyId="key_abc-123_def" />,
    );
    expect(container.textContent).toContain('key_abc-123_def');
  });

  it('should handle special characters in name', () => {
    const { container } = render(
      <ApiKeyCreatedTemplate {...defaultProps} name="José María O'Connor-Smith" />,
    );
    expect(container.textContent).toContain("José María O'Connor-Smith");
  });

  it('should handle special characters in email', () => {
    const { container } = render(
      <ApiKeyCreatedTemplate {...defaultProps} email="test+tag@example-domain.co.uk" />,
    );
    expect(container.textContent).toContain('test+tag@example-domain.co.uk');
  });

  it('should handle long API key names', () => {
    const longName = 'A'.repeat(100);
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} apiKeyName={longName} />);
    expect(container.textContent).toContain(longName);
  });

  it('should handle long API key IDs', () => {
    const longId = 'key_' + 'a'.repeat(50);
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} apiKeyId={longId} />);
    expect(container.textContent).toContain(longId);
  });

  it('should include debug info section', () => {
    const { container } = render(<ApiKeyCreatedTemplate {...defaultProps} />);
    expect(container.textContent).toContain('[Debug Info: All Fields]');
    expect(container.textContent).toContain('apiKeyId: key_abc123');
    expect(container.textContent).toContain('apiKeyName: Production API Key');
    expect(container.textContent).toContain('dashboardUrl: https://example.com/api-keys');
    expect(container.textContent).toContain('email: user@example.com');
    expect(container.textContent).toContain('name: John Doe');
  });
});
