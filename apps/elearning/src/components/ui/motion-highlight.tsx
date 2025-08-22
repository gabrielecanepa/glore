'use client'

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { AnimatePresence, motion, type Transition } from 'motion/react'

import { type Any } from '@repo/utils/types'

import { cn } from '@/lib/utils'

interface Bounds {
  height: number
  left: number
  top: number
  width: number
}

interface MotionHighlightContextType<T extends string> {
  activeClassName?: string
  activeValue: T | null
  className?: string
  clearBounds: () => void
  disabled?: boolean
  enabled?: boolean
  exitDelay?: number
  forceUpdateBounds?: boolean
  hover: boolean
  id: string
  mode: 'children' | 'parent'
  setActiveClassName: (className: string) => void
  setActiveValue: (value: T | null) => void
  setBounds: (bounds: DOMRect) => void
  transition?: Transition
}

interface BaseMotionHighlightProps<T extends string> {
  className?: string
  defaultValue?: T | null
  disabled?: boolean
  enabled?: boolean
  exitDelay?: number
  hover?: boolean
  mode?: 'children' | 'parent'
  onValueChange?: (value: T | null) => void
  transition?: Transition
  value?: T | null
}

interface ParentModeMotionHighlightProps {
  boundsOffset?: Partial<Bounds>
  containerClassName?: string
  forceUpdateBounds?: boolean
}

type ControlledParentModeMotionHighlightProps<T extends string> = BaseMotionHighlightProps<T> &
  ParentModeMotionHighlightProps & {
    mode: 'parent'
    controlledItems: true
    children: React.ReactNode
  }

type ControlledChildrenModeMotionHighlightProps<T extends string> = BaseMotionHighlightProps<T> & {
  mode?: 'children' | undefined
  controlledItems: true
  children: React.ReactNode
}

type UncontrolledParentModeMotionHighlightProps<T extends string> = BaseMotionHighlightProps<T> &
  ParentModeMotionHighlightProps & {
    mode: 'parent'
    controlledItems?: false
    itemsClassName?: string
    children: React.ReactElement | React.ReactElement[]
  }

type UncontrolledChildrenModeMotionHighlightProps<T extends string> = BaseMotionHighlightProps<T> & {
  mode?: 'children'
  controlledItems?: false
  itemsClassName?: string
  children: React.ReactElement | React.ReactElement[]
}

type ExtendedChildProps = React.ComponentProps<'div'> & {
  id?: string
  ref?: React.Ref<HTMLElement>
  'data-active'?: string
  'data-value'?: string
  'data-disabled'?: boolean
  'data-highlight'?: boolean
  'data-slot'?: string
}

export type MotionHighlightProps<T extends string> = React.ComponentProps<'div'> &
  (
    | ControlledParentModeMotionHighlightProps<T>
    | ControlledChildrenModeMotionHighlightProps<T>
    | UncontrolledParentModeMotionHighlightProps<T>
    | UncontrolledChildrenModeMotionHighlightProps<T>
  ) & {
    transition?: Transition
  }

export interface MotionHighlightItemProps extends React.ComponentProps<'div'> {
  activeClassName?: string
  asChild?: boolean
  children: React.ReactElement
  className?: string
  disabled?: boolean
  exitDelay?: number
  forceUpdateBounds?: boolean
  id?: string
  transition?: Transition
  value?: string
}

const MotionHighlightContext = createContext<MotionHighlightContextType<Any> | undefined>(undefined)

export const useMotionHighlight = <T extends string>(): MotionHighlightContextType<T> => {
  const context = useContext(MotionHighlightContext)
  if (!context) throw new Error('useMotionHighlight must be used within a MotionHighlightProvider')
  return context as unknown as MotionHighlightContextType<T>
}

export const MotionHighlight = <T extends string>({ ref, ...props }: MotionHighlightProps<T>) => {
  const {
    children,
    className,
    controlledItems,
    defaultValue,
    disabled = false,
    enabled = true,
    exitDelay = 0.2,
    hover = false,
    mode = 'children',
    onValueChange,
    transition = {
      type: 'spring',
      stiffness: 350,
      damping: 35,
    },
    value,
  } = props

  const localRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

  const [activeValue, setActiveValue] = useState<T | null>(value ?? defaultValue ?? null)
  const [boundsState, setBoundsState] = useState<Bounds | null>(null)
  const [activeClassNameState, setActiveClassNameState] = useState<string>('')

  const safeSetActiveValue = useCallback(
    (id: T | null) => {
      setActiveValue(prev => (prev === id ? prev : id))
      if (id !== activeValue) onValueChange?.(id as T)
    },
    [activeValue, onValueChange],
  )

  const safeSetBounds = useCallback(
    (bounds: DOMRect) => {
      if (!localRef.current) return

      const boundsOffset = (props as ParentModeMotionHighlightProps)?.boundsOffset ?? {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      }

      const containerRect = localRef.current.getBoundingClientRect()

      const newBounds: Bounds = {
        top: bounds.top - containerRect.top + (boundsOffset.top ?? 0),
        left: bounds.left - containerRect.left + (boundsOffset.left ?? 0),
        width: bounds.width + (boundsOffset.width ?? 0),
        height: bounds.height + (boundsOffset.height ?? 0),
      }

      setBoundsState(prev => {
        if (
          prev &&
          prev.top === newBounds.top &&
          prev.left === newBounds.left &&
          prev.width === newBounds.width &&
          prev.height === newBounds.height
        ) {
          return prev
        }

        return newBounds
      })
    },
    [props],
  )

  const clearBounds = useCallback(() => {
    setBoundsState(prev => (prev === null ? prev : null))
  }, [])

  useEffect(() => {
    if (value !== undefined) setActiveValue(value)
    else if (defaultValue !== undefined) setActiveValue(defaultValue)
  }, [value, defaultValue])

  const id = useId()

  useEffect(() => {
    if (mode !== 'parent') return
    const container = localRef.current

    if (!container) return

    const onScroll = () => {
      if (!activeValue) return
      const activeEl = container.querySelector<HTMLElement>(`[data-value="${activeValue}"][data-highlight="true"]`)

      if (activeEl) safeSetBounds(activeEl.getBoundingClientRect())
    }

    container.addEventListener('scroll', onScroll, { passive: true })

    return () => container.removeEventListener('scroll', onScroll)
  }, [mode, activeValue, safeSetBounds])

  const render = useCallback(
    (children: React.ReactNode) => {
      if (mode === 'parent') {
        return (
          <div
            className={cn('relative', (props as ParentModeMotionHighlightProps)?.containerClassName)}
            data-slot="motion-highlight-container"
            ref={localRef}
          >
            <AnimatePresence initial={false}>
              {boundsState && (
                <motion.div
                  animate={{
                    top: boundsState.top,
                    left: boundsState.left,
                    width: boundsState.width,
                    height: boundsState.height,
                    opacity: 1,
                  }}
                  className={cn('absolute z-0 bg-muted', className, activeClassNameState)}
                  data-slot="motion-highlight"
                  exit={{
                    opacity: 0,
                    transition: {
                      ...transition,
                      delay: (transition?.delay ?? 0) + (exitDelay ?? 0),
                    },
                  }}
                  initial={{
                    top: boundsState.top,
                    left: boundsState.left,
                    width: boundsState.width,
                    height: boundsState.height,
                    opacity: 0,
                  }}
                  transition={transition}
                />
              )}
            </AnimatePresence>
            {children}
          </div>
        )
      }

      return children
    },
    [mode, props, boundsState, transition, exitDelay, className, activeClassNameState],
  )

  return (
    <MotionHighlightContext.Provider
      value={{
        mode,
        activeValue,
        setActiveValue: safeSetActiveValue,
        id,
        hover,
        className,
        transition,
        disabled,
        enabled,
        exitDelay,
        setBounds: safeSetBounds,
        clearBounds,
        activeClassName: activeClassNameState,
        setActiveClassName: setActiveClassNameState,
        forceUpdateBounds: (props as ParentModeMotionHighlightProps)?.forceUpdateBounds,
      }}
    >
      {enabled
        ? controlledItems
          ? render(children)
          : render(
              Children.map(children, (child, index) => (
                <MotionHighlightItem className={props?.itemsClassName} key={index}>
                  {child}
                </MotionHighlightItem>
              )),
            )
        : children}
    </MotionHighlightContext.Provider>
  )
}

const getNonOverridingDataAttributes = (
  element: React.ReactElement,
  dataAttributes: Record<string, unknown>,
): Record<string, unknown> =>
  Object.keys(dataAttributes).reduce<Record<string, unknown>>((acc, key) => {
    if ((element.props as Record<string, unknown>)[key] === undefined) {
      acc[key] = dataAttributes[key]
    }
    return acc
  }, {})

export const MotionHighlightItem = ({
  activeClassName,
  asChild = false,
  children,
  className,
  disabled = false,
  exitDelay,
  forceUpdateBounds,
  id,
  ref,
  transition,
  value,
  ...props
}: MotionHighlightItemProps) => {
  const itemId = useId()

  const {
    activeValue,
    className: contextClassName,
    clearBounds,
    disabled: contextDisabled,
    enabled,
    exitDelay: contextExitDelay,
    forceUpdateBounds: contextForceUpdateBounds,
    hover,
    id: contextId,
    mode,
    setActiveClassName,
    setActiveValue,
    setBounds,
    transition: contextTransition,
  } = useMotionHighlight()

  const element = children as React.ReactElement<ExtendedChildProps>
  const childValue = id ?? value ?? element.props?.['data-value'] ?? element.props?.id ?? itemId
  const isActive = activeValue === childValue
  const isDisabled = disabled === undefined ? contextDisabled : disabled
  const itemTransition = transition ?? contextTransition

  const localRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

  useEffect(() => {
    if (mode !== 'parent') return
    let rafId: number
    let previousBounds: Bounds | null = null
    const shouldUpdateBounds = forceUpdateBounds === true || (contextForceUpdateBounds && forceUpdateBounds !== false)

    const updateBounds = () => {
      if (!localRef.current) return

      const bounds = localRef.current.getBoundingClientRect()

      if (shouldUpdateBounds) {
        if (
          previousBounds &&
          previousBounds.top === bounds.top &&
          previousBounds.left === bounds.left &&
          previousBounds.width === bounds.width &&
          previousBounds.height === bounds.height
        ) {
          rafId = requestAnimationFrame(updateBounds)

          return
        }

        previousBounds = bounds
        rafId = requestAnimationFrame(updateBounds)
      }

      setBounds(bounds)
    }

    if (isActive) {
      updateBounds()
      setActiveClassName(activeClassName ?? '')
    } else if (!activeValue) clearBounds()

    if (shouldUpdateBounds) return () => cancelAnimationFrame(rafId)
  }, [
    mode,
    isActive,
    activeValue,
    setBounds,
    clearBounds,
    activeClassName,
    setActiveClassName,
    forceUpdateBounds,
    contextForceUpdateBounds,
  ])

  if (!isValidElement(children)) return children

  const dataAttributes = {
    'data-active': isActive ? 'true' : 'false',
    'aria-selected': isActive,
    'data-disabled': isDisabled,
    'data-value': childValue,
    'data-highlight': true,
  }

  const commonHandlers = hover
    ? {
        onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
          setActiveValue(childValue)
          element.props.onMouseEnter?.(e)
        },
        onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
          setActiveValue(null)
          element.props.onMouseLeave?.(e)
        },
      }
    : {
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          setActiveValue(childValue)
          element.props.onClick?.(e)
        },
      }

  if (asChild) {
    if (mode === 'children') {
      return cloneElement(
        element,
        {
          key: childValue,
          ref: localRef,
          className: cn('relative', element.props.className),
          ...getNonOverridingDataAttributes(element, {
            ...dataAttributes,
            'data-slot': 'motion-highlight-item-container',
          }),
          ...commonHandlers,
          ...props,
        },
        <>
          <AnimatePresence initial={false}>
            {isActive && !isDisabled && (
              <motion.div
                animate={{ opacity: 1 }}
                className={cn('absolute inset-0 z-0 bg-muted', contextClassName, activeClassName)}
                data-slot="motion-highlight"
                exit={{
                  opacity: 0,
                  transition: {
                    ...itemTransition,
                    delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0),
                  },
                }}
                initial={{ opacity: 0 }}
                layoutId={`transition-background-${contextId}`}
                transition={itemTransition}
                {...dataAttributes}
              />
            )}
          </AnimatePresence>

          <div className={cn('relative z-[1]', className)} data-slot="motion-highlight-item" {...dataAttributes}>
            {children}
          </div>
        </>,
      )
    }

    return cloneElement(element, {
      ref: localRef,
      ...getNonOverridingDataAttributes(element, {
        ...dataAttributes,
        'data-slot': 'motion-highlight-item',
      }),
      ...commonHandlers,
    })
  }

  return enabled ? (
    <div
      className={cn(mode === 'children' && 'relative', className)}
      data-slot="motion-highlight-item-container"
      key={childValue}
      ref={localRef}
      {...dataAttributes}
      {...props}
      {...commonHandlers}
    >
      {mode === 'children' && (
        <AnimatePresence initial={false}>
          {isActive && !isDisabled && (
            <motion.div
              animate={{ opacity: 1 }}
              className={cn('absolute inset-0 z-0 bg-muted', contextClassName, activeClassName)}
              data-slot="motion-highlight"
              exit={{
                opacity: 0,
                transition: {
                  ...itemTransition,
                  delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0),
                },
              }}
              initial={{ opacity: 0 }}
              layoutId={`transition-background-${contextId}`}
              transition={itemTransition}
              {...dataAttributes}
            />
          )}
        </AnimatePresence>
      )}

      {cloneElement(element, {
        className: cn('relative z-[1]', element.props.className),
        ...getNonOverridingDataAttributes(element, {
          ...dataAttributes,
          'data-slot': 'motion-highlight-item',
        }),
      })}
    </div>
  ) : (
    children
  )
}
