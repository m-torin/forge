import { getNavigation } from '@/data/navigation';

import Aside from './aside';
import SidebarNavigation from './Header/Navigation/SidebarNavigation';

interface Props {
  className?: string;
}

const AsideSidebarNavigation = async ({ className }: Props) => {
  const navigationMenu = await getNavigation();

  return (
    <Aside
      contentMaxWidthClassName="max-w-md"
      logoOnHeading
      openFrom="right"
      type="sidebar-navigation"
    >
      <div className="flex h-full flex-col">
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
          <SidebarNavigation data={navigationMenu} />
        </div>
      </div>
    </Aside>
  );
};

export default AsideSidebarNavigation;
