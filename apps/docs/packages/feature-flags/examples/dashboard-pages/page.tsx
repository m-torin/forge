import { dashboardFlag } from './flags';

export default async function DashboardPage() {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const dashboard = await dashboardFlag();
  // do something with the flag
  return <div>Dashboard</div>;
}
