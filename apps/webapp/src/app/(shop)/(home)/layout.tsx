import Header2 from '@/components/Header/Header2';
import { ApplicationLayout } from '../application-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ApplicationLayout header={<Header2 hasBorder={false} />}>{children}</ApplicationLayout>;
}
