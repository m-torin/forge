import clsx from 'clsx'
import Image from 'next/image'
import { type FC } from 'react'

import imgAds from '../../images/ads.png'

export interface SectionAdsProps {
  className?: string
}

const SectionAds: FC<SectionAdsProps> = ({ className }) => {
  return (
    <div className={clsx(className)}>
      <Image width={400} className="w-full" alt="ads" height={400} src={imgAds} />
    </div>
  )
}

export default SectionAds
