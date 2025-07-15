import { Metadata } from 'next/types';
import { MonitoringUI } from './ui';
import { PageFrame } from '#/ui/shared';

export const metadata: Metadata = {
  title: 'Health & Monitoring | Flowbuilder',
};

const MonitoringPage = (): React.JSX.Element => (
  <PageFrame title="Health & Monitoring">
    <MonitoringUI />
  </PageFrame>
);

export default MonitoringPage;
