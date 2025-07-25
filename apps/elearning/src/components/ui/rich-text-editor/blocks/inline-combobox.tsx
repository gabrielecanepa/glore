'use client'

import {
  createContext,
  forwardRef,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Combobox,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxRow,
  Portal,
  useComboboxContext,
  useComboboxStore,
  type ComboboxItemProps,
} from '@ariakit/react'
import { filterWords } from '@platejs/combobox'
import { useComboboxInput, useHTMLInputCursorState, type UseComboboxInputResult } from '@platejs/combobox/react'
import { cva } from 'class-variance-authority'
import type { Point, TElement } from 'platejs'
import { useComposedRef, useEditorRef } from 'platejs/react'

import { cn } from '@/lib/utils'

type FilterFn = (
  item: { value: string; group?: string; keywords?: string[]; label?: string },
  search: string,
) => boolean

interface InlineComboboxContextValue {
  filter: FilterFn | false
  inputProps: UseComboboxInputResult['props']
  inputRef: React.RefObject<HTMLInputElement | null>
  removeInput: UseComboboxInputResult['removeInput']
  showTrigger: boolean
  trigger: string
  setHasEmpty: (hasEmpty: boolean) => void
}

export const InlineComboboxContext = createContext<InlineComboboxContextValue>(
  null as unknown as InlineComboboxContextValue,
)

const defaultFilter: FilterFn = ({ group, keywords = [], label, value }, search) => {
  const uniqueTerms = new Set([value, ...keywords, group, label].filter(Boolean))

  return Array.from(uniqueTerms).some(keyword => filterWords(keyword!, search))
}

interface InlineComboboxProps {
  children: React.ReactNode
  element: TElement
  trigger: string
  filter?: FilterFn | false
  hideWhenNoValue?: boolean
  showTrigger?: boolean
  value?: string
  setValue?: (value: string) => void
}

export const InlineCombobox = ({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) => {
  const editor = useEditorRef()
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorState = useHTMLInputCursorState(inputRef)

  const [valueState, setValueState] = useState('')
  const hasValueProp = valueProp !== undefined
  const value = hasValueProp ? valueProp : valueState

  const setValue = useCallback(
    (newValue: string) => {
      setValueProp?.(newValue)

      if (!hasValueProp) {
        setValueState(newValue)
      }
    },
    [setValueProp, hasValueProp],
  )

  /**
   * Track the point just before the input element so we know where to
   * insertText if the combobox closes due to a selection change.
   */
  const insertPoint = useRef<Point | null>(null)

  useEffect(() => {
    const path = editor.api.findPath(element)

    if (!path) return

    const point = editor.api.before(path)

    if (!point) return

    const pointRef = editor.api.pointRef(point)
    insertPoint.current = pointRef.current

    return () => {
      pointRef.unref()
    }
  }, [editor, element])

  const { props: inputProps, removeInput } = useComboboxInput({
    cancelInputOnBlur: true,
    cursorState,
    ref: inputRef,
    onCancelInput: cause => {
      if (cause !== 'backspace') {
        editor.tf.insertText(trigger + value, {
          at: insertPoint?.current ?? undefined,
        })
      }
      if (cause === 'arrowLeft' || cause === 'arrowRight') {
        editor.tf.move({
          distance: 1,
          reverse: cause === 'arrowLeft',
        })
      }
    },
  })

  const [hasEmpty, setHasEmpty] = useState(false)

  const contextValue: InlineComboboxContextValue = useMemo(
    () => ({
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [trigger, showTrigger, filter, inputRef, inputProps, removeInput, setHasEmpty],
  )

  const store = useComboboxStore({
    // open: ,
    setValue: newValue => startTransition(() => setValue(newValue)),
  })

  const items = store.useState('items')

  /**
   * If there is no active ID and the list of items changes, select the first
   * item.
   */
  useEffect(() => {
    if (!store.getState().activeId) {
      store.setActiveId(store.first())
    }
  }, [items, store])

  return (
    <span contentEditable={false}>
      <ComboboxProvider open={(items.length > 0 || hasEmpty) && (!hideWhenNoValue || value.length > 0)} store={store}>
        <InlineComboboxContext.Provider value={contextValue}>{children}</InlineComboboxContext.Provider>
      </ComboboxProvider>
    </span>
  )
}

export const InlineComboboxInput = forwardRef<HTMLInputElement, React.HTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, propRef) => {
    const { inputProps, inputRef: contextRef, showTrigger, trigger } = useContext(InlineComboboxContext)

    const store = useComboboxContext()!
    const value = store.useState('value')

    const ref = useComposedRef(propRef, contextRef)

    /**
     * To create an auto-resizing input, we render a visually hidden span
     * containing the input value and position the input element on top of it.
     * This works well for all cases except when input exceeds the width of the
     * container.
     */

    return (
      <>
        {showTrigger && trigger}

        <span className="relative min-h-[1lh]">
          <span aria-hidden="true" className="invisible overflow-hidden text-nowrap">
            {value || '\u200B'}
          </span>

          <Combobox
            autoSelect
            className={cn('absolute top-0 left-0 size-full bg-transparent outline-none', className)}
            ref={ref}
            value={value}
            {...inputProps}
            {...props}
          />
        </span>
      </>
    )
  },
)

export const InlineComboboxContent: typeof ComboboxPopover = ({ className, ...props }) => (
  <Portal>
    <ComboboxPopover
      className={cn('z-500 max-h-[288px] w-[300px] overflow-y-auto rounded-md bg-popover shadow-md', className)}
      {...props}
    />
  </Portal>
)

const comboboxItemVariants = cva(
  `
    relative mx-1 flex h-[28px] items-center rounded-sm px-2 text-sm text-foreground outline-none select-none
    [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
  `,
  {
    defaultVariants: {
      interactive: true,
    },
    variants: {
      interactive: {
        false: '',
        true: `
          cursor-pointer transition-colors
          hover:bg-accent hover:text-accent-foreground
          data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground
        `,
      },
    },
  },
)

export const InlineComboboxItem = ({
  className,
  focusEditor = true,
  group,
  keywords,
  label,
  onClick,
  ...props
}: {
  focusEditor?: boolean
  group?: string
  keywords?: string[]
  label?: string
} & ComboboxItemProps &
  Required<Pick<ComboboxItemProps, 'value'>>) => {
  const { value } = props

  const { filter, removeInput } = useContext(InlineComboboxContext)

  const store = useComboboxContext()!

  // Optimization: Do not subscribe to value if filter is false
  const search = filter && store.useState('value')

  const visible = useMemo(
    () => !filter || filter({ group, keywords, label, value }, search as string),
    [filter, group, keywords, label, value, search],
  )

  if (!visible) return null

  return (
    <ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={event => {
        removeInput(focusEditor)
        onClick?.(event)
      }}
      {...props}
    />
  )
}

export const InlineComboboxEmpty = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { setHasEmpty } = useContext(InlineComboboxContext)
  const store = useComboboxContext()!
  const items = store.useState('items')

  useEffect(() => {
    setHasEmpty(true)

    return () => {
      setHasEmpty(false)
    }
  }, [setHasEmpty])

  if (items.length > 0) return null

  return <div className={cn(comboboxItemVariants({ interactive: false }), className)}>{children}</div>
}

export const InlineComboboxRow = ComboboxRow

export const InlineComboboxGroup = ({ className, ...props }: React.ComponentProps<typeof ComboboxGroup>) => (
  <ComboboxGroup {...props} className={cn('hidden py-1.5 not-last:border-b [&:has([role=option])]:block', className)} />
)

export const InlineComboboxGroupLabel = ({ className, ...props }: React.ComponentProps<typeof ComboboxGroupLabel>) => (
  <ComboboxGroupLabel
    {...props}
    className={cn('mt-1.5 mb-2 px-3 text-xs font-medium text-muted-foreground', className)}
  />
)
