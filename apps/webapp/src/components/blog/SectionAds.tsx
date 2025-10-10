import imgAds from '@/images/ads.png';
import clsx from 'clsx';
import Image from 'next/image';
import { FC } from 'react';

interface SectionAdsProps {
  className?: string;
}

const SectionAds: FC<SectionAdsProps> = ({ className }) => {
  return (
    <div className={clsx(className)}>
      <Image
        alt="ads"
        className="w-full"
        src={imgAds}
        width={imgAds.width}
        height={imgAds.height}
      />
    </div>
  );
};

export default SectionAds;
