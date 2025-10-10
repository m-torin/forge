import { FC } from 'react';

export interface BgGlassmorphismProps {
  className?: string;
}

const BgGlassmorphism: FC<BgGlassmorphismProps> = ({
  className = 'absolute inset-x-0 md:top-10 min-h-0 pl-20 py-24 flex overflow-hidden z-0',
}) => {
  return (
    <div className={`nc-BgGlassmorphism ${className}`} data-nc-id="BgGlassmorphism">
      <span className="block h-72 w-72 rounded-full bg-[#ef233c] opacity-10 mix-blend-multiply blur-3xl filter lg:h-96 lg:w-96" />
      <span className="nc-animation-delay-2000 -ml-20 mt-40 block h-72 w-72 rounded-full bg-[#04868b] opacity-10 mix-blend-multiply blur-3xl filter lg:h-96 lg:w-96" />
    </div>
  );
};

export default BgGlassmorphism;
