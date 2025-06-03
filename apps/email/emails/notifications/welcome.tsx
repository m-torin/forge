import { WelcomeTemplate } from '@repo/email/templates/welcome';

const ExampleWelcomeEmail = () => (
  <WelcomeTemplate
    dashboardUrl="https://example.com/dashboard"
    organizationName="Acme Corp"
    email="jane@example.com"
    name="Jane Smith"
  />
);

export default ExampleWelcomeEmail;
