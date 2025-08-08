'use client';

interface AnimatedMenuIconProps {
  isOpen: boolean;
  size?: number;
}

export function AnimatedMenuIcon({ isOpen, size = 20 }: AnimatedMenuIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-300"
    >
      <line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        className={`transition-all duration-300 ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`}
        style={{
          transformOrigin: 'center',
          transform: isOpen ? 'rotate(45deg) translateY(6px)' : 'none',
        }}
      />
      <line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        className={`transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      />
      <line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        className={`transition-all duration-300 ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`}
        style={{
          transformOrigin: 'center',
          transform: isOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
        }}
      />
    </svg>
  );
}
