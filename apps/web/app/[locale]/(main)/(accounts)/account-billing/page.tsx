import { getLinkedAccounts } from '@/actions/auth';
import { BillingContent } from './billing-content';

export const metadata = {
  description: 'Account - Payments & billing page',
  title: 'Account - Payments & billing',
};

const Page = async () => {
  const result = await getLinkedAccounts();
  const linkedAccounts = (result as any).data || [];

  return <BillingContent linkedAccounts={linkedAccounts} />;
};

export default Page;
