import { Metadata } from 'next/types';
import { PageFrame } from '#/ui/shared';
import { AuditTable } from '#/ui/reporting';

export const metadata: Metadata = {
  title: 'Auditing | Flowbuilder',
};

const AuditingPage = (): React.JSX.Element => (
  <PageFrame title="Auditing">
    <AuditTable />
  </PageFrame>
);

export default AuditingPage;
