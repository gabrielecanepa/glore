'use client'

import { createContext, useState } from 'react'

interface SyncStateContext {
  setSyncState: (state: 'syncing' | 'error' | 'complete') => void
  syncState: 'syncing' | 'error' | 'complete'
}

export const SyncStateContext = createContext<SyncStateContext | null>(null)

export const SyncStateProvider = (props: React.PropsWithChildren) => {
  const [syncState, setSyncState] = useState<SyncStateContext['syncState']>('complete')
  return <SyncStateContext.Provider value={{ syncState, setSyncState }} {...props} />
}
