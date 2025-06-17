import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';

import imgAds from '../../images/ads.png';

export interface SectionAdsProps extends Record<string, any> {
  className?: string;
}

const SectionAds: FC<SectionAdsProps> = ({ className }: any) => {
  return (
    <div className={clsx(className)}>
      <Image alt="ads" className="w-full" height={400} src={imgAds} width={400} />
    </div>
  );
};

export default SectionAds;
