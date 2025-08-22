import { usePathname as useNextPathname } from 'next/navigation'
import { useContext, useMemo } from 'react'

import { PathnameContext } from '@/components/providers/pathname-provider'
import { type Pathname } from '@/lib/navigation'

/**
 * Extends the default `usePathname` hook to provide type-safe access to
 * the application routes and allow optimistic UI updates.
 */
export const usePathname = () => {
  const context = useContext(PathnameContext)
  if (!context) throw new Error('usePathname must be used within a PathnameProvider')

  const pathname = useNextPathname() as Pathname
  const isLoadingPath = useMemo(() => pathname !== context.uiPathname, [pathname, context.uiPathname])

  return { pathname, isLoadingPath, ...context }
}
