import React from 'react'

import ButtonClose from '../ButtonClose/ButtonClose'

export interface AlertProps {
  children?: React.ReactNode
  containerClassName?: string
  type?: 'default' | 'warning' | 'info' | 'success' | 'error'
}

export const Alert: React.FC<AlertProps> = ({ type = 'default', children = 'Alert Text', containerClassName = '' }) => {
  let classes = containerClassName
  switch (type) {
    case 'default':
      classes += ' text-black bg-neutral-900'
      break
    case 'info':
      classes += ' bg-status-infoBg text-status-info'
      break
    case 'success':
      classes += ' bg-status-successBg text-status-success'
      break
    case 'error':
      classes += ' bg-status-errorBg text-status-error'
      break
    case 'warning':
      classes += ' bg-status-warningBg text-status-warning'
      break
    default:
      break
  }

  return (
    <div className={`ttnc-alert text-paragraph-base relative flex items-center rounded-lg px-6 pb-3 pt-4 ${classes}`}>
      <i className="pe-7s-info mr-2 text-2xl" />
      {children}
      <ButtonClose className="absolute right-6 top-4" />
    </div>
  )
}
