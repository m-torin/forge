import Header from '@/components/Header/Header'
import { FC } from 'react'
import { ApplicationLayout } from '../application-layout'

interface Props {
  children?: React.ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <ApplicationLayout header={<Header hasBorderBottom />} footer={<div />}>
      {children}
    </ApplicationLayout>
  )
}

export default Layout
