import { dashboardFlag } from './flags';

export default async function DashboardPage() {
  const _dashboard = await dashboardFlag();
  // do something with the flag
  return <div>Dashboard</div>;
}
