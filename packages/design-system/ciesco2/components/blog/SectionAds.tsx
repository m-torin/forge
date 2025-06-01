import imgAds from '../../images/ads.png';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';

export interface SectionAdsProps {
  className?: string;
}

const SectionAds: FC<SectionAdsProps> = ({ className }) => {
  return (
    <div className={clsx(className)}>
      <Image
        width={imgAds.width}
        className="w-full"
        alt="ads"
        height={imgAds.height}
        src={imgAds}
      />
    </div>
  );
};

export default SectionAds;
