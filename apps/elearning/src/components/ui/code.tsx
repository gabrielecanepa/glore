import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

const Code = forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <code
    className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
    ref={ref}
    {...props}
  />
))

export { Code, type CodeProps }
