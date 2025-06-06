import { getCollections } from "@repo/design-system/mantine-ciseco/data/data";
import { getNavigation } from "@repo/design-system/mantine-ciseco/data/navigation";
import ClientHeaderWithData from "./ClientHeaderWithData";

export interface ServerHeaderProps {
  hasBorder?: boolean;
  onCartClick?: () => void;
  onMenuClick?: () => void;
  cartCount?: number;
}

const ServerHeader = async ({
  hasBorder = true,
  onCartClick,
  onMenuClick,
  cartCount = 0,
}: ServerHeaderProps) => {
  const navigationMenu = await getNavigation();
  const allCollections = await getCollections();

  return (
    <ClientHeaderWithData
      hasBorder={hasBorder}
      onCartClick={onCartClick}
      onMenuClick={onMenuClick}
      cartCount={cartCount}
      navigationMenu={navigationMenu}
      featuredCollection={allCollections[10]}
    />
  );
};

export default ServerHeader;
