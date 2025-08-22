import { type JSX } from 'react'

import { type LucideProps } from 'lucide-react'
import { DynamicIcon as LucideDynamic, type IconName } from 'lucide-react/dynamic'

import { cn } from '@/lib/utils'

export interface DynamicIconProps extends LucideProps {
  fallback?: () => JSX.Element
  name: IconName
  placeholder?: React.ComponentType<React.HTMLAttributes<HTMLElement>>
  placeholderProps?: React.HTMLAttributes<HTMLElement>
}

export const DynamicIcon = ({
  className,
  placeholder: Placeholder,
  placeholderProps = {},
  ...props
}: DynamicIconProps) => {
  if (!Placeholder) return <LucideDynamic {...props} />

  const { className: placeholderClassName, ...rest } = placeholderProps

  return (
    <>
      <LucideDynamic className={cn('peer', className)} {...props} />
      <Placeholder className={cn('peer-has-[*]:hidden', placeholderClassName)} {...rest} />
    </>
  )
}
