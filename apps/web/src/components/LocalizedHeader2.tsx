"use client";

import { type FC } from "react";

import { Header2 } from "@repo/design-system/mantine-ciseco";
import { LocaleWrapper } from "@repo/design-system/mantine-ciseco/wrappers/withLocale";

import type { TCollection, TNavigationItem } from "@/data/data-service";

export interface Props {
  featuredCollection?: TCollection;
  hasBorder?: boolean;
  locale?: string;
  navigationMenu?: TNavigationItem[];
}

const LocalizedHeader2: FC<Props> = ({
  featuredCollection,
  hasBorder = true,
  locale = "en",
  navigationMenu = [],
}) => {
  return (
    <LocaleWrapper locale={locale}>
      <Header2
        featuredCollection={featuredCollection}
        hasBorder={hasBorder}
        navigationMenu={navigationMenu}
      />
    </LocaleWrapper>
  );
};

export default LocalizedHeader2;
