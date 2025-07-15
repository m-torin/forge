import { rem } from '@mantine/core';

interface FlowbuilderMarkIconProps
  extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number | string;
}

export function FlowbuilderMarkIcon({
  size = 60,
  style,
  ...others
}: FlowbuilderMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={rem(size)}
      height={rem(size)}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      {...others}
    >
      {/* Background rectangle */}
      <rect width="24" height="24" rx="4" fill="#E0F7FA" />
      {/* New icon design */}
      <g
        stroke="var(--mantine-color-cyan-6)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M7 3v6" />
        <path d="M7 15v6" />
        <path d="M13 7h2.5l1.5 5l-1.5 5h-2.5" />
        <path d="M17 12h3" />
      </g>
    </svg>
  );
}
