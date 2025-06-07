import { getCollections } from "@repo/design-system/mantine-ciseco/data/data";
import { getNavigation } from "@repo/design-system/mantine-ciseco/data/navigation";

import ClientHeaderWithData from "./ClientHeaderWithData";

export interface ServerHeaderProps {
  cartCount?: number;
  hasBorder?: boolean;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

const ServerHeader = async ({
  cartCount = 0,
  hasBorder = true,
  onCartClick,
  onMenuClick,
}: ServerHeaderProps) => {
  const navigationMenu = await getNavigation();
  const allCollections = await getCollections();

  return (
    <ClientHeaderWithData
      cartCount={cartCount}
      featuredCollection={allCollections[10]}
      hasBorder={hasBorder}
      navigationMenu={navigationMenu}
      onCartClick={onCartClick}
      onMenuClick={onMenuClick}
    />
  );
};

export default ServerHeader;
