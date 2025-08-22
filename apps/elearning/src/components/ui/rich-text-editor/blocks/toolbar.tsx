'use client'

import { useEffect, useMemo, useState } from 'react'

import * as ToolbarPrimitive from '@radix-ui/react-toolbar'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'

import { DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, type TooltipContentProps, type TooltipTriggerProps } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const Toolbar = ({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Root>) => (
  <ToolbarPrimitive.Root className={cn('relative flex items-center select-none', className)} {...props} />
)

export const ToolbarToggleGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToolbarToggleGroup>) => (
  <ToolbarPrimitive.ToolbarToggleGroup className={cn('flex items-center', className)} {...props} />
)

export const ToolbarLink = ({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Link>) => (
  <ToolbarPrimitive.Link className={cn('font-medium underline underline-offset-4', className)} {...props} />
)

export const ToolbarSeparator = ({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) => (
  <ToolbarPrimitive.Separator className={cn('mx-2 my-1 w-px shrink-0 bg-border', className)} {...props} />
)

const toolbarButtonVariants = cva(
  `
    inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap
    transition-[color,box-shadow] outline-none
    hover:bg-muted
    focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
    disabled:pointer-events-none disabled:opacity-50
    aria-checked:bg-accent aria-checked:text-accent-foreground
    aria-expanded:cursor-default!
    aria-invalid:border-destructive aria-invalid:ring-destructive/20
    dark:aria-invalid:ring-destructive/40
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 min-w-9 px-2',
        lg: 'h-10 min-w-10 px-2.5',
        sm: 'h-8 min-w-8 px-1.5',
        xs: 'h-7 min-w-7 px-1 [&_svg]:size-3.5!',
      },
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
    },
  },
)

const dropdownArrowVariants = cva(
  `
    inline-flex items-center justify-center rounded-r-md text-sm font-medium text-foreground transition-colors
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 w-6',
        lg: 'h-10 w-8',
        sm: 'h-8 w-4',
      },
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline: 'border border-l-0 border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
    },
  },
)

interface ToolbarButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ToolbarToggleItem>, 'asChild' | 'value'>,
    VariantProps<typeof toolbarButtonVariants> {
  isDropdown?: boolean
  pressed?: boolean
  tooltip?: string
  tooltipContentProps?: React.ComponentPropsWithoutRef<typeof TooltipContent>
  tooltipProps?: TooltipProps<'button'>
  tooltipTriggerProps?: React.ComponentPropsWithoutRef<typeof TooltipTrigger>
}

export const ToolbarButton = ({
  children,
  className,
  isDropdown,
  pressed,
  size = 'sm',
  tooltip,
  tooltipContentProps,
  tooltipProps,
  tooltipTriggerProps,
  variant,
  ...props
}: ToolbarButtonProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const showTooltip = useMemo(() => !!tooltip && mounted && !pressed, [tooltip, mounted, pressed])

  const content = useMemo(
    () =>
      typeof pressed === 'boolean' ? (
        <ToolbarToggleGroup disabled={props.disabled} type="single" value="single">
          <ToolbarToggleItem
            className={cn(
              toolbarButtonVariants({ size, variant }),
              isDropdown && 'justify-between gap-1 pr-1',
              className,
            )}
            value={pressed ? 'single' : ''}
            {...props}
          >
            {isDropdown ? (
              <>
                <div className="flex flex-1 items-center gap-2 whitespace-nowrap">{children}</div>
                <div>
                  <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
                </div>
              </>
            ) : (
              children
            )}
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      ) : (
        <ToolbarPrimitive.Button
          className={cn(toolbarButtonVariants({ size, variant }), isDropdown && 'pr-1', className)}
          {...props}
        >
          {children}
        </ToolbarPrimitive.Button>
      ),
    [children, className, isDropdown, pressed, size, variant, props],
  )

  if (showTooltip) {
    return (
      <Tooltip {...tooltipProps}>
        <TooltipTrigger asChild {...tooltipTriggerProps}>
          {content}
        </TooltipTrigger>
        <TooltipContent {...tooltipContentProps}>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export const ToolbarSplitButton = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof ToolbarButton>) => (
  <ToolbarButton className={cn('group flex gap-0 px-0 hover:bg-transparent', className)} {...props} />
)

export interface ToolbarSplitButtonPrimaryProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ToolbarToggleItem>, 'value'>,
    VariantProps<typeof toolbarButtonVariants> {
  tooltip?: string
  tooltipContentProps?: TooltipContentProps
  tooltipTriggerProps?: TooltipTriggerProps
}

export const ToolbarSplitButtonPrimary = ({
  children,
  className,
  size = 'sm',
  tooltip,
  tooltipContentProps,
  tooltipTriggerProps,
  variant,
  ...props
}: ToolbarSplitButtonPrimaryProps) => {
  const button = useMemo(
    () => (
      <span
        className={cn(
          toolbarButtonVariants({ size, variant }),
          'rounded-r-none group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </span>
    ),
    [children, className, size, variant, props],
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild {...tooltipTriggerProps}>
          {button}
        </TooltipTrigger>
        <TooltipContent {...tooltipContentProps}>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}

export const ToolbarSplitButtonSecondary = ({
  className,
  size,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<'span'> & VariantProps<typeof dropdownArrowVariants>) => (
  <span
    className={cn(
      dropdownArrowVariants({
        size,
        variant,
      }),
      'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
      className,
    )}
    onClick={e => e.stopPropagation()}
    role="button"
    {...props}
  >
    <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
  </span>
)

export const ToolbarToggleItem = ({
  className,
  size = 'sm',
  variant,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> & VariantProps<typeof toolbarButtonVariants>) => (
  <ToolbarPrimitive.ToggleItem className={cn(toolbarButtonVariants({ size, variant }), className)} {...props} />
)

export const ToolbarGroup = ({
  children,
  className,
  separator = true,
}: React.ComponentProps<'div'> & {
  separator?: boolean
}) => (
  <div className={cn('group/toolbar-group relative hidden has-[button]:flex', className)}>
    <div className="flex items-center gap-1">{children}</div>

    {separator && (
      <div className="mx-1.5 py-0.5 group-last/toolbar-group:hidden!">
        <Separator orientation="vertical" />
      </div>
    )}
  </div>
)

type TooltipProps<T extends React.ElementType> = {
  tooltip?: React.ReactNode
  tooltipContentProps?: Omit<React.ComponentPropsWithoutRef<typeof TooltipContent>, 'children'>
  tooltipProps?: Omit<React.ComponentPropsWithoutRef<typeof Tooltip>, 'children'>
  tooltipTriggerProps?: React.ComponentPropsWithoutRef<typeof TooltipTrigger>
} & React.ComponentProps<T>

const TooltipContent = ({
  children,
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        `
          z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-foreground/85 px-3 py-1.5 text-xs text-balance
          text-background
        `,
        className,
      )}
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      {...props}
    >
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
)

export const ToolbarMenuGroup = ({
  children,
  className,
  label,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup> & { label?: string }) => (
  <>
    <DropdownMenuSeparator
      className={cn(
        'hidden',
        `
          mb-0 shrink-0
          peer-has-[[role=menuitem]]/menu-group:block
          peer-has-[[role=menuitemradio]]/menu-group:block
          peer-has-[[role=option]]/menu-group:block
        `,
      )}
    />

    <DropdownMenuRadioGroup
      {...props}
      className={cn(
        'hidden',
        'peer/menu-group group/menu-group my-1.5 has-[[role=menuitem]]:block has-[[role=menuitemradio]]:block has-[[role=option]]:block',
        className,
      )}
    >
      {label && (
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground select-none">
          {label}
        </DropdownMenuLabel>
      )}
      {children}
    </DropdownMenuRadioGroup>
  </>
)
