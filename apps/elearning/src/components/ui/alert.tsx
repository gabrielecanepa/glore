import { cva, type VariantProps } from 'class-variance-authority'

import { type Icon } from '@/components/ui/icons/types'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  `
    relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm
    has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-2
    [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current
  `,
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
        info: `
          text-blue-800 border-blue-200 bg-blue-50 [&>svg]:text-blue-800 *:data-[slot=alert-description]:text-blue-800/80
          dark:text-blue-300 dark:[&>svg]:text-blue-300 dark:border-blue-600 dark:bg-blue-900/50 dark:*:data-[slot=alert-description]:text-blue-400/95
        `,
        warning: `
          text-yellow-800 border-yellow-300 bg-yellow-50 [&>svg]:text-yellow-800 *:data-[slot=alert-description]:text-yellow-800/80
          dark:text-yellow-300 dark:[&>svg]:text-yellow-300 dark:border-yellow-600 dark:bg-yellow-900/50 dark:*:data-[slot=alert-description]:text-yellow-400/95
        `,
        success: `
          text-green-800 border-green-200 bg-green-50 [&>svg]:text-green-800 *:data-[slot=alert-description]:text-green-800/80
          dark:text-green-300 dark:[&>svg]:text-green-300 dark:border-green-600 dark:bg-green-900/50 dark:*:data-[slot=alert-description]:text-green-400/95
        `,
        neutral: `
          text-gray-800 border-gray-200 bg-gray-50 [&>svg]:text-gray-800 *:data-[slot=alert-description]:text-gray-800/80
          dark:text-gray-300 dark:[&>svg]:text-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:*:data-[slot=alert-description]:text-gray-400/95
        `,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface AlertProps extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {}

export const Alert = ({ className, variant, ...props }: AlertProps) => (
  <div className={cn(alertVariants({ variant }), className)} data-slot="alert" role="alert" {...props} />
)

export const AlertTitle = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
    data-slot="alert-title"
    {...props}
  />
)

export const AlertDescription = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed',
      className,
    )}
    data-slot="alert-description"
    {...props}
  />
)

export const AlertCallout = ({
  description,
  icon: Icon,
  title,
  ...props
}: AlertProps & {
  description?: string
  icon: Icon
  title?: string
}) => (
  <Alert {...props}>
    {Icon && <Icon />}
    {title && <AlertTitle>{title}</AlertTitle>}
    {description && <AlertDescription>{description}</AlertDescription>}
  </Alert>
)
