'use client'

import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'

export const Breadcrumb = ({ ...props }: React.ComponentProps<'nav'>) => (
  <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
)

export const BreadcrumbList = ({ className, ...props }: React.ComponentProps<'ol'>) => (
  <ol
    className={cn('flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5', className)}
    data-slot="breadcrumb-list"
    {...props}
  />
)

export const BreadcrumbItem = ({ className, ...props }: React.ComponentProps<'li'>) => (
  <li className={cn('inline-flex items-center gap-1.5', className)} data-slot="breadcrumb-item" {...props} />
)

export const BreadcrumbLink = ({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
}) => {
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      className={cn('cursor-pointer transition-colors hover:text-foreground', className)}
      data-slot="breadcrumb-link"
      {...props}
    />
  )
}

export const BreadcrumbPage = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-current="page"
    aria-disabled="true"
    className={cn('font-normal text-foreground', className)}
    data-slot="breadcrumb-page"
    role="link"
    {...props}
  />
)

export const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) => (
  <li
    aria-hidden="true"
    className={cn('[&>svg]:size-3.5', className)}
    data-slot="breadcrumb-separator"
    role="presentation"
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)

export const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden="true"
    className={cn('flex size-9 items-center justify-center', className)}
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">{'More'}</span>
  </span>
)
