import { getNavigation } from '@/data/navigation';
import SidebarNavigation from './Header/Navigation/SidebarNavigation';
import Aside from './aside';

interface Props {
  className?: string;
}

const AsideSidebarNavigation = async ({ className: _className }: Props) => {
  const navigationMenu = await getNavigation();

  return (
    <Aside
      openFrom="right"
      type="sidebar-navigation"
      logoOnHeading
      contentMaxWidthClassName="max-w-md"
    >
      <div className="flex h-full flex-col">
        <div className="hidden-scrollbar flex-1 overflow-y-auto overflow-x-hidden py-6">
          <SidebarNavigation data={navigationMenu} />
        </div>
      </div>
    </Aside>
  );
};

export default AsideSidebarNavigation;
