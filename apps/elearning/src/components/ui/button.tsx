import { useMemo } from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { Loader } from '@/components/ui/icons/loader'
import { cn } from '@/lib/utils'

export interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'color'>, VariantProps<typeof button> {
  asChild?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

const ButtonRoot = ({ asChild = false, className, color, disabled, hover, size, variant, ...props }: ButtonProps) => {
  const Component = useMemo(() => (asChild ? Slot : 'button'), [asChild])

  return (
    <Component
      className={cn(button({ className, color, disabled, hover, size, variant }))}
      data-slot="button"
      disabled={disabled}
      {...props}
    />
  )
}

export const Button = ({ children, disabled, loading, loadingText, ...props }: ButtonProps) => {
  const isDisabled = useMemo(() => disabled || loading, [disabled, loading])

  return (
    <ButtonRoot disabled={isDisabled} {...props}>
      {loading ? (
        <>
          <Loader />
          {loadingText && <span>{loadingText}</span>}
          {children}
        </>
      ) : (
        children
      )}
    </ButtonRoot>
  )
}

const button = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none',
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  ],
  {
    defaultVariants: {
      color: 'default',
      hover: true,
      size: 'default',
      variant: 'default',
      disabled: false,
    },
    variants: {
      variant: {
        default: 'text-accent-foreground',
        outline: 'border bg-transparent',
        ghost: 'bg-transparent',
        link: '!h-auto border-none bg-transparent !p-0 font-normal',
      },
      color: {
        default: 'text-accent-foreground focus-visible:ring-accent/20 dark:focus-visible:ring-accent/40',
        primary: 'text-primary-foreground shadow-xs focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40',
        secondary:
          'text-secondary-foreground shadow-xs focus-visible:ring-secondary/20 dark:focus-visible:ring-secondary/40',
        tertiary:
          'text-tertiary-foreground shadow-xs focus-visible:ring-tertiary/20 dark:focus-visible:ring-tertiary/40',
        destructive:
          'text-destructive-foreground shadow-xs focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        success: 'text-success-foreground shadow-xs focus-visible:ring-success/20 dark:focus-visible:ring-success/40',
        muted: 'text-muted-foreground shadow-xs',
      },
      hover: {
        true: '',
      },
      size: {
        default: 'h-9 px-3 has-[>svg]:px-2.5',
        sm: 'h-8 px-2 text-sm has-[>svg]:px-2',
        lg: 'h-10 px-4 has-[>svg]:px-3',
        xl: 'h-11 px-5 text-base has-[>svg]:px-4',
        icon: 'size-9',
      },
      disabled: {
        true: 'cursor-default opacity-50',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        color: 'primary',
        className: 'bg-primary',
      },
      {
        variant: 'default',
        color: 'secondary',
        className: 'bg-secondary',
      },
      {
        variant: 'default',
        color: 'tertiary',
        className: 'bg-tertiary',
      },
      {
        variant: 'default',
        color: 'destructive',
        className: 'bg-destructive',
      },
      {
        variant: 'default',
        color: 'success',
        className: 'bg-success',
      },
      {
        variant: 'default',
        color: 'muted',
        className: 'bg-muted text-muted-foreground',
      },
      {
        variant: ['outline', 'ghost'],
        hover: true,
        disabled: false,
        className: 'hover:bg-accent hover:text-accent-foreground',
      },
      {
        variant: 'link',
        hover: true,
        disabled: false,
        className: 'hover:bg-transparent hover:text-accent-foreground',
      },
      {
        variant: 'outline',
        color: 'default',
        className: 'border-input',
      },
      {
        color: 'primary',
        hover: true,
        disabled: false,
        className: 'hover:bg-primary-accent',
      },
      {
        color: 'secondary',
        hover: true,
        disabled: false,
        className: 'hover:bg-secondary-accent',
      },
      {
        color: 'tertiary',
        hover: true,
        disabled: false,
        className: 'hover:bg-tertiary-accent',
      },
      {
        color: 'destructive',
        hover: true,
        disabled: false,
        className: 'hover:bg-destructive-accent',
      },
      {
        color: 'success',
        hover: true,
        disabled: false,
        className: 'hover:bg-success-accent',
      },
      {
        color: 'success',
        variant: 'outline',
        className: 'border-success text-success',
      },
      {
        color: 'muted',
        hover: true,
        disabled: false,
        className: 'hover:bg-muted hover:text-muted-foreground',
      },
    ],
  },
)
