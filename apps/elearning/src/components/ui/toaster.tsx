'use client'

import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'sonner'

import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export interface ToasterProps extends Omit<SonnerProps, 'closeButton'> {
  closeButton?: boolean | 'hover'
}

export const Toaster = ({
  className,
  closeButton = 'hover',
  duration = 3_000,
  position = 'top-center',
  richColors = true,
  ...props
}: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      className={cn('group', className)}
      closeButton={!!closeButton}
      duration={duration}
      position={position}
      richColors={richColors}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      theme={theme}
      toastOptions={{
        classNames: {
          toast:
            'group toast w-max! shadow-xs! shadow-muted group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground',
          title: 'font-normal!',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-base',
          actionButton: 'group-[.toast]:bg-brand-secondary group-[.toast]:text-brand-secondary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: cn(
            'group-data-[type=info]:border-blue-100! group-data-[type=info]:hover:bg-blue-100/80!',
            closeButton === 'hover' && 'opacity-0 group-hover:opacity-100',
          ),
        },
      }}
      {...props}
    />
  )
}
