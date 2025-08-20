'use client'

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps, type Transition } from 'motion/react'

import { MotionHighlight, MotionHighlightItem } from '@/components/ui/motion-highlight'
import { cn } from '@/lib/utils'

export interface MotionTabsContext {
  activeValue: string
  handleValueChange: (value: string) => void
  registerTrigger: (value: string, node: HTMLElement | null) => void
}

export const MotionTabsContext = createContext<MotionTabsContext | undefined>(undefined)

export const useMotionMotionTabs = (): MotionTabsContext => {
  const context = useContext(MotionTabsContext)
  if (!context) throw new Error('useMotionMotionTabs must be used within a MotionTabsProvider')
  return context
}

export interface MotionTabsProps extends React.ComponentProps<'div'> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export const MotionTabs = ({ children, className, defaultValue, onValueChange, value, ...props }: MotionTabsProps) => {
  const [activeValue, setActiveValue] = useState<string | undefined>(defaultValue ?? undefined)
  const triggersRef = useRef(new Map<string, HTMLElement>())
  const initialSet = useRef(false)
  const isControlled = value !== undefined

  useEffect(() => {
    if (!isControlled && activeValue === undefined && triggersRef.current.size > 0 && !initialSet.current) {
      const firstTab = Array.from(triggersRef.current.keys())[0]
      setActiveValue(firstTab)
      initialSet.current = true
    }
  }, [activeValue, isControlled])

  const registerTrigger = (value: string, node: HTMLElement | null) => {
    if (!node) return triggersRef.current.delete(value)
    triggersRef.current.set(value, node)
    if (!isControlled && activeValue === undefined && !initialSet.current) {
      setActiveValue(value)
      initialSet.current = true
    }
  }

  const handleValueChange = useCallback(
    (value: string) => {
      if (!isControlled) return setActiveValue(value)
      onValueChange?.(value)
    },
    [isControlled, onValueChange],
  )

  return (
    <MotionTabsContext.Provider
      value={{
        activeValue: (value ?? activeValue)!,
        handleValueChange,
        registerTrigger,
      }}
    >
      <div className={cn('flex flex-col gap-2', className)} data-slot="motion-tabs" {...props}>
        {children}
      </div>
    </MotionTabsContext.Provider>
  )
}

export interface MotionTabsListProps extends React.ComponentProps<'div'> {
  activeClassName?: string
  transition?: Transition
}

export const MotionTabsList = ({
  activeClassName,
  children,
  className,
  transition = {
    type: 'spring',
    duration: 0.1,
    stiffness: 250,
    damping: 30,
  },
  ...props
}: MotionTabsListProps) => {
  const { activeValue } = useMotionMotionTabs()

  return (
    <MotionHighlight
      className={cn('rounded-sm bg-background shadow-sm', activeClassName)}
      controlledItems
      transition={transition}
      value={activeValue}
    >
      <div
        className={cn(
          'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted/50 p-0.5 text-muted-foreground',
          className,
        )}
        data-slot="motion-tabs-list"
        role="tablist"
        {...props}
      >
        {children}
      </div>
    </MotionHighlight>
  )
}

export interface MotionTabsTriggerProps extends HTMLMotionProps<'button'> {
  badgeProps?: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof motionTabsTriggerBadge>
  count?: number
  showZeroCount?: boolean
  value: string
}

export const MotionTabsTrigger = ({
  badgeProps,
  children,
  className,
  count = 0,
  ref,
  showZeroCount = false,
  value,
  ...props
}: MotionTabsTriggerProps) => {
  const { activeValue, handleValueChange, registerTrigger } = useMotionMotionTabs()

  const localRef = useRef<HTMLButtonElement | null>(null)
  const showCount = useMemo(() => count !== undefined && (showZeroCount || count > 0), [count, showZeroCount])
  const { variant, ...badgeRest } = badgeProps ?? {}

  useImperativeHandle(ref, () => localRef.current as HTMLButtonElement)

  useEffect(() => {
    registerTrigger(value, localRef.current)
    return () => registerTrigger(value, null)
  }, [value, registerTrigger])

  return (
    <MotionHighlightItem
      activeClassName="border border-input bg-background shadow-sm dark:bg-input/30"
      className="size-full"
      value={value}
    >
      <motion.button
        className={cn(
          `
            group/motion-tabs-trigger inline-flex h-full flex-1 cursor-pointer items-center justify-center rounded-md border-2
            border-transparent px-4 py-1 text-sm whitespace-nowrap text-muted-foreground select-none
            data-[active=true]:pointer-events-none data-[active=true]:text-foreground
            dark:text-foreground dark:data-[active=true]:text-foreground
            [&_svg]:shrink-0
            [&_svg:not([class*="size-"])]:size-4
          `,
          className,
        )}
        data-slot="motion-tabs-trigger"
        data-state={activeValue === value ? 'active' : 'inactive'}
        onClick={() => handleValueChange(value)}
        ref={localRef}
        role="tab"
        {...props}
      >
        {showCount ? (
          <span className="flex items-center gap-1 data-[active=true]:text-foreground" {...badgeRest}>
            {children as React.ReactNode}
            <span className={cn(motionTabsTriggerBadge({ variant }))}>{count}</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    </MotionHighlightItem>
  )
}

export const motionTabsTriggerBadge = cva('text-stroke-0', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'text-muted-foreground/50 group-data-[state=active]/motion-tabs-trigger:text-muted-foreground',
      success: 'text-success/50 group-data-[state=active]/motion-tabs-trigger:text-success',
      warning: 'text-warning/50 group-data-[state=active]/motion-tabs-trigger:text-warning',
      destructive: 'text-destructive/50 group-data-[state=active]/motion-tabs-trigger:text-destructive',
    },
  },
})

export interface MotionTabsContentsProps extends React.ComponentProps<'div'> {
  transition?: Transition
}

export const MotionTabsContents = ({
  children,
  className,
  transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  ...props
}: MotionTabsContentsProps) => {
  const { activeValue } = useMotionMotionTabs()
  const childrenArray = Children.toArray(children)

  const activeIndex = childrenArray.findIndex(
    (child): child is React.ReactElement<{ value: string }> =>
      isValidElement(child) &&
      typeof child.props === 'object' &&
      child.props !== null &&
      'value' in child.props &&
      child.props.value === activeValue,
  )

  return (
    <div className={cn('overflow-hidden', className)} data-slot="motion-tabs-contents" {...props}>
      <motion.div animate={{ x: `${activeIndex * -100}%` }} className="-mx-2 flex" transition={transition}>
        {childrenArray.map((child, index) => (
          <div className="w-full shrink-0 px-2" key={index}>
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export interface MotionTabsContentProps extends HTMLMotionProps<'div'> {
  value: string
}

export const MotionTabsContent = ({ children, className, value, ...props }: MotionTabsContentProps) => {
  const { activeValue } = useMotionMotionTabs()
  const isActive = useMemo(() => activeValue === value, [activeValue, value])

  return (
    <motion.div
      animate={{ filter: isActive ? 'blur(0px)' : 'blur(2px)' }}
      className={cn('overflow-hidden', className)}
      data-slot="motion-tabs-content"
      exit={{ filter: 'blur(0px)' }}
      initial={{ filter: 'blur(0px)' }}
      role="tabpanel"
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
