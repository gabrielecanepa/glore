'use client'

import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'

export const Sheet = ({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) => (
  <SheetPrimitive.Root data-slot="sheet" {...props} />
)

export const SheetTrigger = ({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) => (
  <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
)

export const SheetClose = ({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) => (
  <SheetPrimitive.Close data-slot="sheet-close" {...props} />
)

export const SheetPortal = ({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) => (
  <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
)

export const SheetOverlay = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className,
    )}
    data-slot="sheet-overlay"
    {...props}
  />
)

export const SheetContent = ({
  children,
  className,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}) => {
  const t = useTranslations('Common')

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          `
            fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out
            data-[state=closed]:duration-300 data-[state=closed]:animate-out
            data-[state=open]:duration-500 data-[state=open]:animate-in
          `,
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
          side === 'top' &&
            'inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'bottom' &&
            'inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          className,
        )}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className={`
            absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity
            hover:opacity-100
            focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden
            disabled:pointer-events-none
            data-[state=open]:bg-brand
          `}
        >
          <XIcon className="size-4" />
          <span className="sr-only">{t('close')}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

export const SheetHeader = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('flex flex-col gap-1.5 p-4', className)} data-slot="sheet-header" {...props} />
)

export const SheetFooter = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} data-slot="sheet-footer" {...props} />
)

export const SheetTitle = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title className={cn('font-semibold text-foreground', className)} data-slot="sheet-title" {...props} />
)

export const SheetDescription = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
    data-slot="sheet-description"
    {...props}
  />
)
