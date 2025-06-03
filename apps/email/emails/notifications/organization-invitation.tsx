import { OrganizationInvitationTemplate } from '@repo/email/templates/organization-invitation';

const ExampleOrganizationInvitationEmail = () => (
  <OrganizationInvitationTemplate
    organizationName="Acme Corp"
    email="jane@example.com"
    expiresIn="48 hours"
    inviteLink="https://example.com/accept-invitation/abc123"
    inviterEmail="john@acmecorp.com"
    inviterName="John Doe"
  />
);

export default ExampleOrganizationInvitationEmail;
