'use client'

import { createContext, useState } from 'react'

interface HeaderContext {
  header?: React.JSX.Element
  setHeader: (breadcrumb?: React.JSX.Element) => void
  setShadow: (value: boolean) => void
  shadow?: boolean
}

export const HeaderContext = createContext<HeaderContext | null>(null)

export const HeaderProvider = (props: React.PropsWithChildren) => {
  const [header, setHeader] = useState<React.JSX.Element | undefined>(undefined)
  const [shadow, setShadow] = useState<boolean>(false)

  return <HeaderContext.Provider value={{ header, setHeader, shadow, setShadow }} {...props} />
}
