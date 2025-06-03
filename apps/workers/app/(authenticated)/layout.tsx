import { AppShellLayout } from '@/components/app-shell-layout';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
