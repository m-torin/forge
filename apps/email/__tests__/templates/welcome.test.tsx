import { WelcomeTemplate } from '@repo/email/templates/welcome';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('WelcomeTemplate', () => {
  const defaultProps = {
    name: 'John Doe',
    email: 'john@example.com',
    organizationName: 'Acme Corp',
  };

  it('should render with required props', () => {
    const { container } = render(<WelcomeTemplate {...defaultProps} />);
    expect(container.textContent).toContain('Welcome to Acme Corp');
    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).toContain('john@example.com');
  });

  it('should render welcome message with name', () => {
    const { container } = render(<WelcomeTemplate {...defaultProps} />);
    expect(container.textContent).toContain('Hi John Doe!');
  });

  it('should include welcome content', () => {
    const { container } = render(<WelcomeTemplate {...defaultProps} />);
    expect(container.textContent).toMatch(/Welcome to Acme Corp/i);
    expect(container.textContent).toMatch(/Congratulations/i);
    expect(container.textContent).toMatch(/You've successfully created/i);
  });

  it('should render dashboard button with default URL', () => {
    const { container } = render(<WelcomeTemplate {...defaultProps} />);
    const button = container.querySelector('a[href="https://example.com/dashboard"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Go to Dashboard');
  });

  it('should render dashboard button with custom URL', () => {
    const { container } = render(
      <WelcomeTemplate {...defaultProps} dashboardUrl="https://custom.com/dash" />,
    );
    const button = container.querySelector('a[href="https://custom.com/dash"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Go to Dashboard');
  });

  it('should handle empty name', () => {
    const { container } = render(<WelcomeTemplate {...defaultProps} name="" />);
    expect(container.textContent).toContain('Hi !');
  });

  it('should handle special characters in name', () => {
    const { container } = render(
      <WelcomeTemplate {...defaultProps} name="José María O'Connor-Smith" />,
    );
    expect(container.textContent).toContain("Hi José María O'Connor-Smith!");
  });

  it('should handle long names', () => {
    const longName = 'A'.repeat(100);
    const { container } = render(<WelcomeTemplate {...defaultProps} name={longName} />);
    expect(container.textContent).toContain(`Hi ${longName}!`);
  });

  it('should handle special characters in email', () => {
    const { container } = render(
      <WelcomeTemplate {...defaultProps} email="test+tag@example-domain.co.uk" />,
    );
    expect(container.textContent).toContain('test+tag@example-domain.co.uk');
  });

  it('should handle special characters in organization name', () => {
    const { container } = render(
      <WelcomeTemplate {...defaultProps} organizationName="José & María's Corp" />,
    );
    expect(container.textContent).toContain("Welcome to José & María's Corp");
  });

  it('should include debug info section', () => {
    const { container } = render(<WelcomeTemplate {...defaultProps} />);
    expect(container.textContent).toContain('[Debug Info: All Fields]');
    expect(container.textContent).toContain('dashboardUrl: https://example.com/dashboard');
    expect(container.textContent).toContain('email: john@example.com');
    expect(container.textContent).toContain('name: John Doe');
    expect(container.textContent).toContain('organizationName: Acme Corp');
  });
});
