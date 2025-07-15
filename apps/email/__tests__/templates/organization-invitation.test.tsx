import { OrganizationInvitationTemplate } from '@repo/email/templates/organization-invitation';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('OrganizationInvitationTemplate', () => {
  const defaultProps = {
    email: 'invitee@example.com',
    inviteLink: 'https://example.com/invite?token=abc123',
    inviterEmail: 'inviter@example.com',
    organizationName: 'Acme Corp',
  };

  it('should render with required props', () => {
    const { container } = render(<OrganizationInvitationTemplate {...defaultProps} />);
    expect(container.textContent).toContain("You've been invited");
    expect(container.textContent).toContain('Acme Corp');
    expect(container.textContent).toContain('invitee@example.com');
  });

  it('should render invitation message', () => {
    const { container } = render(<OrganizationInvitationTemplate {...defaultProps} />);
    expect(container.textContent).toMatch(/You've been invited to join/i);
    expect(container.textContent).toMatch(/Acme Corp/i);
  });

  it('should render accept invitation button with correct link', () => {
    const { container } = render(<OrganizationInvitationTemplate {...defaultProps} />);
    const button = container.querySelector('a[href="https://example.com/invite?token=abc123"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Accept Invitation');
  });

  it('should include inviter information when name is provided', () => {
    const { container } = render(
      <OrganizationInvitationTemplate {...defaultProps} inviterName="Jane Smith" />,
    );
    expect(container.textContent).toContain('Jane Smith');
    expect(container.textContent).toContain('inviter@example.com');
  });

  it('should handle missing inviter name', () => {
    const { container } = render(<OrganizationInvitationTemplate {...defaultProps} />);
    expect(container.textContent).toContain('inviter@example.com');
    expect(container.textContent).not.toContain('null');
  });

  it('should handle null inviter name', () => {
    const { container } = render(
      <OrganizationInvitationTemplate {...defaultProps} inviterName={null} />,
    );
    expect(container.textContent).toContain('inviter@example.com');
    expect(container.textContent).not.toContain('null');
  });

  it('should handle expiresIn prop', () => {
    const { container } = render(
      <OrganizationInvitationTemplate {...defaultProps} expiresIn="7 days" />,
    );
    expect(container.textContent).toMatch(/7 days/);
  });

  it('should include security notice', () => {
    const { container } = render(<OrganizationInvitationTemplate {...defaultProps} />);
    expect(container.textContent).toMatch(/If you don't want to join this organization/i);
  });

  it('should handle special characters in organization name', () => {
    const { container } = render(
      <OrganizationInvitationTemplate {...defaultProps} organizationName="José & María's Corp" />,
    );
    expect(container.textContent).toContain("José & María's Corp");
  });

  it('should handle special characters in inviter name', () => {
    const { container } = render(
      <OrganizationInvitationTemplate {...defaultProps} inviterName="José María O'Connor-Smith" />,
    );
    expect(container.textContent).toContain("José María O'Connor-Smith");
  });

  it('should handle special characters in email addresses', () => {
    const { container } = render(
      <OrganizationInvitationTemplate
        {...defaultProps}
        email="test+tag@example-domain.co.uk"
        inviterEmail="inviter+tag@example-domain.co.uk"
      />,
    );
    expect(container.textContent).toContain('test+tag@example-domain.co.uk');
    expect(container.textContent).toContain('inviter+tag@example-domain.co.uk');
  });

  it('should include debug info section', () => {
    const { container } = render(<OrganizationInvitationTemplate {...defaultProps} />);
    expect(container.textContent).toContain('[Debug Info: All Fields]');
    expect(container.textContent).toContain('email: invitee@example.com');
    expect(container.textContent).toContain('inviteLink: https://example.com/invite?token=abc123');
    expect(container.textContent).toContain('inviterEmail: inviter@example.com');
    expect(container.textContent).toContain('organizationName: Acme Corp');
  });
});
