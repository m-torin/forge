import { dashboardFlag } from './flags';

export default async function DashboardPage() {
  const dashboard = await dashboardFlag();
  // do something with the flag
  return <div>Dashboard</div>;
}
