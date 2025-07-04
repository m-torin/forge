import React, { ButtonHTMLAttributes } from 'react'

export interface ButtonCircleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: string
}

const ButtonCircle: React.FC<ButtonCircleProps> = ({ className = ' ', size = ' w-9 h-9 ', ...args }) => {
  return (
    <button
      className={`flex items-center justify-center rounded-full bg-neutral-900 leading-none! text-neutral-50 hover:bg-neutral-800 disabled:bg-neutral-900/70 ${className} ${size}`}
      {...args}
    />
  )
}

export default ButtonCircle
