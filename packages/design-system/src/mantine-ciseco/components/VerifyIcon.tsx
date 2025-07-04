import React, { type FC } from 'react';

export interface VerifyIconProps extends Record<string, any> {
  animate?: string;
  className?: string;
  fillRule?: 'evenodd' | 'inherit' | 'nonzero';
  gradient?: boolean;
  iconClass?: string;
  preserveAspectRatio?: string;
  size?: number | { base: number; lg: number; md: number; sm: number };
  strokeWidth?: number;
  viewBox?: string;
}

const VerifyIcon: FC<VerifyIconProps> = ({
  animate,
  className = 'ml-1',
  fillRule,
  gradient,
  iconClass = 'w-5 h-5',
  preserveAspectRatio,
  size,
  strokeWidth = 1.5,
  viewBox = '0 0 17 17',
}) => {
  return (
    <span className={className} data-testid="verify-icon">
      <svg
        className={`${iconClass} ${
          size && typeof size === 'object'
            ? `sm:w-[${size.sm}px] sm:h-[${size.sm}px] md:w-[${size.md}px] md:h-[${size.md}px] lg:w-[${size.lg}px] lg:h-[${size.lg}px]`
            : ''
        }`}
        fill="none"
        fillRule={fillRule}
        preserveAspectRatio={preserveAspectRatio}
        style={{
          ...(size && typeof size === 'number' ? { height: size, width: size } : {}),
          ...(animate ? { animation: animate } : {}),
          ...(gradient
            ? {
                background: 'linear-gradient(45deg, #38BDF8, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
            : {}),
        }}
        viewBox={viewBox}
      >
        <path
          d="M7.66691 2.62178C8.12691 2.22845 8.88025 2.22845 9.34691 2.62178L10.4002 3.52845C10.6002 3.70178 10.9736 3.84178 11.2402 3.84178H12.3736C13.0802 3.84178 13.6602 4.42178 13.6602 5.12845V6.26178C13.6602 6.52178 13.8002 6.90178 13.9736 7.10178L14.8802 8.15512C15.2736 8.61512 15.2736 9.36845 14.8802 9.83512L13.9736 10.8884C13.8002 11.0884 13.6602 11.4618 13.6602 11.7284V12.8618C13.6602 13.5684 13.0802 14.1484 12.3736 14.1484H11.2402C10.9802 14.1484 10.6002 14.2884 10.4002 14.4618L9.34691 15.3684C8.88691 15.7618 8.13358 15.7618 7.66691 15.3684L6.61358 14.4618C6.41358 14.2884 6.04025 14.1484 5.77358 14.1484H4.62025C3.91358 14.1484 3.33358 13.5684 3.33358 12.8618V11.7218C3.33358 11.4618 3.19358 11.0884 3.02691 10.8884L2.12691 9.82845C1.74025 9.36845 1.74025 8.62178 2.12691 8.16178L3.02691 7.10178C3.19358 6.90178 3.33358 6.52845 3.33358 6.26845V5.12178C3.33358 4.41512 3.91358 3.83512 4.62025 3.83512H5.77358C6.03358 3.83512 6.41358 3.69512 6.61358 3.52178L7.66691 2.62178Z"
          fill="#38BDF8"
          stroke="#38BDF8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
        <path
          d="M6.08691 8.98833L7.69358 10.6017L10.9136 7.375"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      </svg>
    </span>
  );
};

export default VerifyIcon;
