'use client'

import { usePathname } from 'next/navigation'
import { createContext, useState } from 'react'

import { type Pathname } from '@/lib/navigation'

interface PathnameContext {
  setUiPathname: React.Dispatch<React.SetStateAction<Pathname>>
  uiPathname: Pathname
}

export const PathnameContext = createContext<PathnameContext | null>(null)

export const PathnameProvider = (props: React.PropsWithChildren) => {
  const pathname = usePathname()
  const [uiPathname, setUiPathname] = useState<Pathname>(pathname as Pathname)
  return <PathnameContext.Provider value={{ uiPathname, setUiPathname }} {...props} />
}
