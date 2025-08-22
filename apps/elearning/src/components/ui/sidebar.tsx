'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { PanelLeftOpenIcon, PanelRightOpenIcon } from 'lucide-react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDevice } from '@/hooks/use-device'
import { useTranslations } from '@/hooks/use-translations'
import { cookies } from '@/lib/storage'
import { cn } from '@/lib/utils'

export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = '16rem'
export const SIDEBAR_WIDTH_MOBILE = '18rem'
export const SIDEBAR_WIDTH_ICON = '3rem'
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

interface SidebarContext {
  isMobile: boolean
  label: string
  open: boolean
  openMobile: boolean
  setOpen: (open: boolean) => void
  setOpenMobile: (open: boolean) => void
  state: 'expanded' | 'collapsed'
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContext | null>(null)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider.')
  return context
}

export const SidebarProvider = ({
  children,
  className,
  defaultOpen = true,
  onOpenChange: setOpenProp,
  open: openProp,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const { isMobile } = useDevice()
  const t = useTranslations()

  const [openMobile, setOpenMobile] = useState(false)
  const [_open, _setOpen] = useState(defaultOpen)

  const open = useMemo(() => openProp ?? _open, [openProp, _open])
  const state = useMemo(() => (open ? 'expanded' : 'collapsed'), [open])

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      cookies.set('sidebar-open', openState, { maxAge: SIDEBAR_COOKIE_MAX_AGE })
    },
    [setOpenProp, open],
  )

  const toggleSidebar = useCallback(
    () => (isMobile ? setOpenMobile(open => !open) : setOpen(open => !open)),
    [isMobile, setOpen, setOpenMobile],
  )

  const label = useMemo(
    () => `${open ? t('Common.close') : t('Common.open')} ${t('Common.sidebar').toLowerCase()}`,
    [open, t],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const contextValue = useMemo<SidebarContext>(
    () => ({
      isMobile,
      label,
      open,
      openMobile,
      setOpen,
      setOpenMobile,
      state,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, label, openMobile, setOpenMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          className={cn('group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar', className)}
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export const Sidebar = ({
  children,
  className,
  collapsible = 'offcanvas',
  side = 'left',
  variant = 'sidebar',
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) => {
  const t = useTranslations()
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        className={cn('flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground', className)}
        data-slot="sidebar"
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet onOpenChange={setOpenMobile} open={openMobile} {...props}>
        <SheetHeader className="sr-only">
          <SheetTitle>{t('Common.sidebar')}</SheetTitle>
          <SheetDescription>{t('Common.sidebarOpen')}</SheetDescription>
        </SheetHeader>
        <SheetContent
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          data-mobile="true"
          data-sidebar="sidebar"
          data-slot="sidebar"
          side={side}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
        >
          <div className="flex size-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden bg-sidebar text-sidebar-foreground md:block"
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side={side}
      data-slot="sidebar"
      data-state={state}
      data-variant={variant}
    >
      <div
        className={cn(
          `
            relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-150 ease-linear
            group-data-[collapsible=offcanvas]:w-0
            group-data-[side=right]:rotate-180
          `,
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-150 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          className,
        )}
        {...props}
      >
        <div
          className={cn(`
            flex size-full flex-col bg-sidebar
            group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border
            group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm
          `)}
          data-sidebar="sidebar"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export const SidebarTrigger = ({ className, onClick, ...props }: React.ComponentProps<typeof Button>) => {
  const { label, open, toggleSidebar } = useSidebar()
  const Icon = useMemo(() => (open ? PanelRightOpenIcon : PanelLeftOpenIcon), [open])

  return (
    <Button
      className={cn('size-10', className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={event => {
        onClick?.(event)
        toggleSidebar()
      }}
      size="icon"
      variant="ghost"
      {...props}
    >
      <Icon className="size-5" />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export const SidebarRail = ({ className, ...props }: React.ComponentProps<'button'>) => {
  const { label, toggleSidebar } = useSidebar()

  return (
    <button
      aria-label={label}
      className={cn(
        `
          absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear
          group-data-[collapsible=offcanvas]:translate-x-0
          group-data-[side=left]:-right-4
          group-data-[side=right]:left-0
          after:absolute after:inset-y-0 after:right-2 after:w-[1px] after:bg-sidebar-border
          group-data-[collapsible=offcanvas]:after:left-full
          hover:after:w-[2px]
          in-data-[side=left]:cursor-w-resize
          in-data-[side=right]:cursor-e-resize
          sm:flex
          [[data-side=left][data-collapsible=offcanvas]_&]:-right-2
          [[data-side=left][data-state=collapsed]_&]:cursor-e-resize
          [[data-side=right][data-collapsible=offcanvas]_&]:-left-2
          [[data-side=right][data-state=collapsed]_&]:cursor-w-resize
        `,
        className,
      )}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      onClick={toggleSidebar}
      tabIndex={-1}
      title={label}
      {...props}
    />
  )
}

export const SidebarInset = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      `
        relative flex min-h-svh flex-1 flex-col bg-background
        peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))]
        md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl
        md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2
      `,
      className,
    )}
    data-slot="sidebar-inset"
    {...props}
  />
)

export const SidebarInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <Input
    className={cn('h-8 w-full bg-background shadow-none', className)}
    data-sidebar="input"
    data-slot="sidebar-input"
    {...props}
  />
)

export const SidebarHeader = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn('flex flex-col gap-2 p-2', className)}
    data-sidebar="header"
    data-slot="sidebar-header"
    {...props}
  />
)

export const SidebarFooter = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn('flex flex-col gap-2 p-2', className)}
    data-sidebar="footer"
    data-slot="sidebar-footer"
    {...props}
  />
)

export const SidebarSeparator = ({ className, ...props }: React.ComponentProps<typeof Separator>) => (
  <Separator
    className={cn('mx-2 w-auto bg-sidebar-border', className)}
    data-sidebar="separator"
    data-slot="sidebar-separator"
    {...props}
  />
)

export const SidebarContent = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
      className,
    )}
    data-sidebar="content"
    data-slot="sidebar-content"
    {...props}
  />
)

export const SidebarGroup = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
    data-sidebar="group"
    data-slot="sidebar-group"
    {...props}
  />
)

export const SidebarGroupLabel = ({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) => {
  const Component = useMemo(() => (asChild ? Slot : 'div'), [asChild])

  return (
    <Component
      className={cn(
        `
          flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden
          transition-[margin,opacity] duration-150 ease-linear
          group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0
          focus-visible:ring-2
          [&>svg]:size-4 [&>svg]:shrink-0
        `,
        className,
      )}
      data-sidebar="group-label"
      data-slot="sidebar-group-label"
      {...props}
    />
  )
}

export const SidebarGroupAction = ({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) => {
  const Comp = useMemo(() => (asChild ? Slot : 'button'), [asChild])

  return (
    <Comp
      className={cn(
        `
          absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground
          ring-sidebar-ring outline-hidden transition-transform
          group-data-[collapsible=icon]:hidden
          after:absolute after:-inset-2
          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
          focus-visible:ring-2
          md:after:hidden
          [&>svg]:size-4 [&>svg]:shrink-0
        `,
        className,
      )}
      data-sidebar="group-action"
      data-slot="sidebar-group-action"
      {...props}
    />
  )
}

export const SidebarGroupContent = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn('w-full text-sm', className)}
    data-sidebar="group-content"
    data-slot="sidebar-group-content"
    {...props}
  />
)

export const SidebarMenu = ({ className, ...props }: React.ComponentProps<'ul'>) => {
  const { open } = useSidebar()

  return (
    <ul
      className={cn('flex w-full min-w-0 flex-col', open ? 'gap-1' : 'gap-[9.2px]', className)}
      data-sidebar="menu"
      data-slot="sidebar-menu"
      {...props}
    />
  )
}

export const SidebarMenuItem = ({ className, ...props }: React.ComponentProps<'li'>) => (
  <li
    className={cn('group/menu-item relative', className)}
    data-sidebar="menu-item"
    data-slot="sidebar-menu-item"
    {...props}
  />
)

export interface SidebarMenuButtonProps
  extends Omit<ButtonProps, 'size' | 'variant'>,
    VariantProps<typeof sidebarMenuButton> {
  active?: boolean
  asChild?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
}

export const SidebarMenuButton = ({
  active = false,
  asChild = false,
  className,
  color,
  onClick,
  size,
  tooltip,
  variant,
  ...props
}: SidebarMenuButtonProps) => {
  const { isMobile, state } = useSidebar()
  const [hideTooltip, setHideTooltip] = useState(false)

  const Component = useMemo(() => (asChild ? Slot : Button), [asChild])

  const content = useMemo(
    () => (
      <Component
        className={cn(sidebarMenuButton({ size, variant }), className)}
        color={color ?? undefined}
        data-active={active}
        data-sidebar="menu-button"
        data-size={size}
        data-slot="sidebar-menu-button"
        {...props}
      />
    ),
    [Component, size, variant, className, color, active, props],
  )

  const hiddenTooltip = useMemo(() => state !== 'collapsed' || isMobile, [state, isMobile])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (isMobile) return
      setHideTooltip(true)
      setTimeout(() => {
        setHideTooltip(false)
      }, 200)
    },
    [onClick, isMobile],
  )

  if (active || isMobile || !tooltip || hideTooltip) return content
  if (typeof tooltip === 'string') tooltip = { children: tooltip }

  return (
    <Tooltip>
      <TooltipTrigger asChild onClick={handleClick}>
        {content}
      </TooltipTrigger>
      <TooltipContent align="center" hidden={hiddenTooltip} side="right" {...tooltip} />
    </Tooltip>
  )
}

export const sidebarMenuButton = cva(
  `
    peer/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md px-3 py-2 text-left text-sm ring-sidebar-ring
    outline-hidden transition-[width,height,padding]
    group-has-data-[sidebar=menu-action]/menu-item:pr-8
    group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!
    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
    active:bg-sidebar-accent active:text-sidebar-accent-foreground
    disabled:pointer-events-none disabled:opacity-50
    aria-disabled:pointer-events-none aria-disabled:opacity-50
    data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground
    data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground
    [&>span:last-child]:truncate
    [&>svg]:shrink-0 [&>svg]:grow-0
  `,
  {
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline: `
          shadow-[0_0_0_1px_hsl(var(--sidebar-border))]
          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]
        `,
      },
      size: {
        base: 'py-2 text-sm',
        sm: 'py-1 text-xs',
        lg: 'py-3 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
  },
)

export const SidebarMenuAction = ({
  asChild = false,
  className,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  clickable?: boolean
  showOnHover?: boolean
}) => {
  const Component = useMemo(() => (asChild ? Slot : 'button'), [asChild])

  return (
    <Component
      className={cn(
        `
          absolute top-2 right-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground
          ring-sidebar-ring outline-hidden transition-transform
          group-data-[collapsible=icon]:hidden
          peer-hover/menu-button:text-sidebar-accent-foreground
          peer-data-[size=default]/menu-button:top-1.5
          peer-data-[size=lg]/menu-button:top-2.5
          peer-data-[size=sm]/menu-button:top-1
          after:absolute after:-inset-2
          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
          focus-visible:ring-2
          md:after:hidden
          [&>svg]:size-4 [&>svg]:shrink-0
        `,
        showOnHover &&
          `
            group-focus-within/menu-item:opacity-100
            group-hover/menu-item:opacity-100
            peer-data-[active=true]/menu-button:text-sidebar-accent-foreground
            data-[state=open]:opacity-100
            md:opacity-0
          `,
        className,
      )}
      data-sidebar="menu-action"
      data-slot="sidebar-menu-action"
      {...props}
    />
  )
}

export const SidebarMenuBadge = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      `
        pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium
        text-sidebar-foreground tabular-nums select-none
        group-data-[collapsible=icon]:hidden
        peer-hover/menu-button:text-sidebar-accent-foreground
        peer-data-[active=true]/menu-button:text-sidebar-accent-foreground
        peer-data-[size=default]/menu-button:top-1.5
        peer-data-[size=lg]/menu-button:top-2.5
        peer-data-[size=sm]/menu-button:top-1
      `,
      className,
    )}
    data-sidebar="menu-badge"
    data-slot="sidebar-menu-badge"
    {...props}
  />
)

export const SidebarMenuSkeleton = ({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean
}) => {
  const width = useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])

  return (
    <div
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      data-sidebar="menu-skeleton"
      data-slot="sidebar-menu-skeleton"
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

export const SidebarMenuSub = ({ className, ...props }: React.ComponentProps<'ul'>) => (
  <ul
    className={cn(
      `
        ms-[18px] flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border py-0.5 ps-2.5
        group-data-[collapsible=icon]:hidden
      `,
      className,
    )}
    data-sidebar="menu-sub"
    data-slot="sidebar-menu-sub"
    {...props}
  />
)

export const SidebarMenuSubItem = ({ className, ...props }: React.ComponentProps<'li'>) => (
  <li
    className={cn('group/menu-sub-item relative', className)}
    data-sidebar="menu-sub-item"
    data-slot="sidebar-menu-sub-item"
    {...props}
  />
)

export const SidebarMenuSubButton = ({
  asChild = false,
  className,
  isActive = false,
  size = 'md',
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
  size?: 'sm' | 'md'
  isActive?: boolean
}) => {
  const Component = useMemo(() => (asChild ? Slot : 'a'), [asChild])

  return (
    <Component
      className={cn(
        `
          flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md border-l-2 border-transparent px-2
          text-sidebar-foreground/80 ring-sidebar-ring outline-hidden
          group-data-[collapsible=icon]:hidden
          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
          focus-visible:ring-2
          disabled:pointer-events-none disabled:opacity-50
          data-[active=true]:rounded-l-none data-[active=true]:border-sidebar-border data-[active=true]:bg-sidebar-accent
          data-[active=true]:text-sidebar-accent-foreground
          [&>span:last-child]:truncate
          [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground
        `,
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        className,
      )}
      data-active={isActive}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-slot="sidebar-menu-sub-button"
      {...props}
    />
  )
}
