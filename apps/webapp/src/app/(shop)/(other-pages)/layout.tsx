import { ApplicationLayout } from '../application-layout';

export default function Layout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <ApplicationLayout>{children}</ApplicationLayout>;
}
