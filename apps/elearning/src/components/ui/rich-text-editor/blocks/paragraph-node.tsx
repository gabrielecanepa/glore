'use client'

import { PlateElement, type PlateElementProps } from 'platejs/react'

import { cn } from '@/lib/utils'

export const ParagraphElement = (props: PlateElementProps) => (
  <PlateElement {...props} className={cn('m-0 px-0 py-1')}>
    {props.children}
  </PlateElement>
)
