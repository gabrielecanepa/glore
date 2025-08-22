import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<'input'>, VariantProps<typeof input> {}

export const Input = ({ className, variant, ...props }: InputProps) => (
  <input className={cn(input({ variant }), className)} {...props} />
)

export const input = cva(
  [
    `
      flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none
      file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
      placeholder:text-muted-foreground
      focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30
      disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
      aria-invalid:border-destructive aria-invalid:ring-destructive/20
      md:text-sm
      dark:bg-input/30 dark:aria-invalid:ring-destructive/40
    `,
  ],
  {
    variants: {
      variant: {
        brand: 'focus-visible:border-brand focus-visible:ring-brand/50',
        'brand-secondary': 'focus-visible:border-brand-secondary focus-visible:ring-brand-secondary/50',
      },
    },
  },
)
