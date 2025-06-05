import { type FC } from "react";

import { Header2 } from "@repo/design-system/mantine-ciseco";
import { LocaleWrapper } from "@repo/design-system/mantine-ciseco/wrappers/withLocale";

export interface Props {
  hasBorder?: boolean;
  locale?: string;
}

const LocalizedHeader2: FC<Props> = async ({
  hasBorder = true,
  locale = "en",
}) => {
  return (
    <LocaleWrapper locale={locale}>
      <Header2 hasBorder={hasBorder} />
    </LocaleWrapper>
  );
};

export default LocalizedHeader2;
