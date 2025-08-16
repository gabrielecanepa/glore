'use client'

import { useMemo } from 'react'

import config from 'config/app.json'

/**
 * Hook exposing the application configuration.
 */
export const useConfig = () =>
  useMemo(
    () =>
      ({
        ...config,
      }) as const,
    [],
  )
