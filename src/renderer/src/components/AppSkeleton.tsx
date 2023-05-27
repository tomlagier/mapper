import { Flex } from '@mantine/core'
import { ReactNode } from 'react'

interface AppSkeletonProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

export function AppSkeleton({ header, sidebar, children }: AppSkeletonProps) {
  return (
    <div style={{ maxHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ width: '100%' }}>{header}</div>
      <Flex>
        <div style={{ width: 300 }}>{sidebar}</div>
        <div style={{ flexGrow: 1 }}>{children}</div>
      </Flex>
    </div>
  )
}
