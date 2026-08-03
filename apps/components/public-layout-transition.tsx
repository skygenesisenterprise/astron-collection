'use client'

import { RouteTransition } from '@/components/route-transition'

export function PublicLayoutTransition({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>
}
