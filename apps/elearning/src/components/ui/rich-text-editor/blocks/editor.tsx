'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import {
  PlateContainer,
  PlateContent,
  PlateView,
  usePlateState,
  type PlateContentProps,
  type PlateViewProps,
} from 'platejs/react'

import { cn } from '@/lib/utils'

export interface EditorProps extends PlateContentProps, Omit<VariantProps<typeof editorVariants>, 'disabled'> {}

export const EditorContainer = ({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof editorContainerVariants>) => (
  <PlateContainer
    className={cn('ignore-click-outside/toolbar', editorContainerVariants({ variant }), className)}
    {...props}
  />
)

export const EditorView = ({ className, variant, ...props }: PlateViewProps & VariantProps<typeof editorVariants>) => (
  <PlateView {...props} className={cn(editorVariants({ variant }), className)} />
)

export const Editor = ({ className, disabled, focused, variant, ...props }: EditorProps) => {
  const [readOnly] = usePlateState('readOnly')

  return (
    <PlateContent
      className={cn(
        editorVariants({ disabled, focused, variant }),
        readOnly && 'rounded-lg border-transparent pt-2',
        className,
      )}
      disabled={disabled}
      disableDefaultStyles
      {...props}
    />
  )
}

const editorContainerVariants = cva(
  `
    relative w-full cursor-text overflow-y-auto select-text
    focus-visible:outline-none
    [&_.slate-selection-area]:z-50 [&_.slate-selection-area]:border
  `,
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        comment: `
          flex flex-wrap justify-between gap-1 rounded-md border-[1.5px] border-transparent bg-transparent px-1 py-0.5 text-sm
          has-aria-disabled:border-input has-aria-disabled:bg-muted
          has-[[data-slate-editor]:focus]:border-brand/50 has-[[data-slate-editor]:focus]:ring-2 has-[[data-slate-editor]:focus]:ring-brand/30
        `,
        default: 'h-full',
        select: `
          group rounded-md border border-input ring-offset-background
          focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
          has-data-readonly:w-fit has-data-readonly:cursor-default has-data-readonly:border-transparent has-data-readonly:focus-within:[box-shadow:none]
        `,
      },
    },
  },
)

const editorVariants = cva(
  cn(
    `
      group/editor relative w-full cursor-text overflow-x-hidden rounded-b-lg border break-words whitespace-pre-wrap ring-offset-background
      select-text
      placeholder:text-muted-foreground/80
      focus-visible:outline-none
      **:data-slate-placeholder:top-1/2! **:data-slate-placeholder:-translate-y-1/2 **:data-slate-placeholder:text-muted-foreground/80
      **:data-slate-placeholder:opacity-100!
      [&_strong]:font-bold
    `,
  ),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      variant: {
        ai: 'w-full px-0 text-base md:text-sm',
        aiChat: 'max-h-[min(70vh,320px)] w-full max-w-[700px] overflow-y-auto px-3 py-2 text-base md:text-sm',
        comment: 'rounded-none border-none bg-transparent text-sm',
        default: 'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'size-full px-8 pt-8 pb-72 text-base sm:px-12',
        select: 'px-3 py-2 text-base data-readonly:w-fit',
      },
    },
  },
)
