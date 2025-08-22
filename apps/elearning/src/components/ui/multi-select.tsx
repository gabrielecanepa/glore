'use client'

import { useCallback, useMemo, useState } from 'react'

import { CommandSeparator } from 'cmdk'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
  type PopoverTriggerProps,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'

export interface MultiSelectProps extends PopoverProps {
  capitalize?: boolean
  contentProps?: PopoverContentProps
  disabled?: boolean
  isLoading?: boolean
  minItems?: {
    count?: number
    message?: string
    delay?: number
  }
  onChange: (selected: string[]) => void
  options: {
    label: string
    value: string
    icon?: React.ReactNode | string
  }[]
  placeholder?: string
  search?: boolean
  toastTimeout?: number
  toastType?: 'info' | 'success' | 'error' | 'warning'
  triggerProps?: PopoverTriggerProps
  value: string[]
}

const MultiSelectBadge = ({
  capitalize,
  className,
  disabled,
  disabledMessage,
  item,
  onSelect,
  options,
  title: userTitle,
  tooltipDelay = 500,
  ...props
}: BadgeProps & {
  capitalize?: boolean
  disabled: boolean
  disabledMessage?: string
  item: string
  onSelect: (item: string) => void
  options: MultiSelectProps['options']
  tooltipDelay?: number
}) => {
  const t = useTranslations('Common')
  const tLang = useTranslations('Languages')

  const { icon, label, value } = useMemo(() => options.find(({ value }) => value === item), [item, options]) ?? {}

  const title = useMemo(() => {
    if (disabled) return undefined
    if (userTitle) return userTitle
    if (!label) return undefined
    const translation = tLang.flat(value!)
    return `${t('remove')} ${capitalize ? translation : translation.toLowerCase()}`
  }, [capitalize, disabled, label, t, tLang, userTitle, value])

  const onClick = useCallback(() => {
    if (disabled) return
    onSelect(item)
  }, [disabled, item, onSelect])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || e.key !== 'Enter') return
      onSelect(item)
    },
    [disabled, item, onSelect],
  )

  const badge = useMemo(
    () => (
      <Badge
        asChild
        className={cn('group h-5.5 px-1.5 py-0', disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}
        key={item}
        onClick={onClick}
        onKeyDown={onKeyDown}
        size="xs"
        tabIndex={0}
        title={title}
        {...props}
      >
        <div className="flex items-center justify-between gap-0.5">
          {icon && <span className="text-base">{icon}</span>}
          <span
            className={cn(
              'translate-x-[3px] rounded-full p-[1.5px] transition-all',
              !disabled &&
                'group-hover:border-destructive-accent group-hover:bg-destructive/75 group-hover:text-destructive-foreground',
            )}
            role="button"
          >
            <X className={cn('size-2', !disabled && 'group-hover:stroke-white')} />
          </span>
        </div>
      </Badge>
    ),
    [className, disabled, icon, item, onClick, onKeyDown, props, title],
  )

  if (!disabled || !disabledMessage) return badge

  return (
    <Tooltip delayDuration={tooltipDelay} disableHoverableContent>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent align="center" arrow={false} className="text-[11px]" side="top">
        {disabledMessage}
      </TooltipContent>
    </Tooltip>
  )
}

export const MultiSelect = ({
  capitalize,
  className,
  contentProps,
  disabled = false,
  isLoading = false,
  minItems,
  onChange,
  search = true,
  toastTimeout = 2_000,
  toastType = 'info',
  triggerProps,
  value,
  ...props
}: MultiSelectProps) => {
  const { isTitleCase } = useLocale()
  const tCommon = useTranslations('Common')
  const tLanguages = useTranslations('Languages')
  const [open, setOpen] = useState(false)
  const [selectTime, setSelectTime] = useState<number | null>(null)

  const placeholder = useMemo(() => props.placeholder ?? tCommon('selectItems'), [props.placeholder, tCommon])
  const { className: contentClassName, ...contentRest } = contentProps || {}
  const { className: triggerClassName, ...triggerRest } = triggerProps || {}
  const { count = 0, delay, message } = minItems || {}

  const options = useMemo(
    () => (props.options ?? []).map(({ label, ...opt }) => ({ ...opt, label: tLanguages.flat(opt.value) ?? label })),
    [props.options, tLanguages],
  )

  const shouldCapitalize = useMemo(
    () => (capitalize === undefined ? isTitleCase() : capitalize),
    [capitalize, isTitleCase],
  )

  const canUnselect = useMemo(() => value.length > count, [count, value.length])

  const isSelected = useCallback((item: string) => value.includes(item), [value])

  const openDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(prev => !prev)
  }, [])

  const onUnselect = useCallback(
    (item: string) => {
      if (canUnselect) return onChange(value.filter(i => i !== item))
      if (selectTime && Date.now() - selectTime < toastTimeout) return

      toast[toastType](message, { duration: 200_000 })
      setSelectTime(Date.now())
    },
    [canUnselect, message, onChange, selectTime, toastTimeout, toastType, value],
  )

  const onSelect = useCallback(
    (item: string) => () => {
      if (value.includes(item)) return onUnselect(item)
      onChange([...value, item])
    },
    [onUnselect, onChange, value],
  )

  const onSelectAll = useCallback(() => {
    onChange(options.map(option => option.value))
  }, [onChange, options])

  const isAllSelected = useMemo(() => value.length === options.length, [value.length, options.length])

  const onButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className={cn('w-full', className)}>
      <Popover onOpenChange={setOpen} open={open} {...props}>
        <PopoverTrigger
          aria-expanded={open}
          className={cn(
            `
              flex h-9 w-full items-center justify-between rounded-md border border-input bg-background text-sm transition-all
              disabled:cursor-not-allowed disabled:opacity-50
            `,
            className,
          )}
          disabled={disabled}
          onClick={onButtonClick}
          {...triggerRest}
        >
          <div className="flex flex-1 justify-between overflow-hidden">
            <div
              className="flex flex-1 gap-1 overflow-x-auto px-3 py-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent',
              }}
            >
              {value.length === 0 ? (
                <span className="truncate text-muted-foreground">{placeholder}</span>
              ) : (
                value.map(item => (
                  <MultiSelectBadge
                    capitalize={shouldCapitalize}
                    disabled={!canUnselect}
                    disabledMessage={message}
                    item={item}
                    key={item}
                    onSelect={onSelect(item)}
                    options={options}
                    tooltipDelay={delay}
                  />
                ))
              )}
            </div>
            <hr className="mx-0.5 my-auto h-6 border-l border-border" />
            <span
              className={cn(
                `
                  mx-1.5 my-auto h-full cursor-pointer rounded-sm p-1 outline-none
                  hover:bg-accent/50
                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                `,
                open && 'cursor-default bg-accent/50',
              )}
              onClick={openDropdown}
              role="button"
              tabIndex={0}
            >
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className={cn('p-0', contentClassName)} {...contentRest}>
          <Command>
            {search && <CommandInput autoFocus placeholder={`${tCommon('searchItems')}...`} />}
            <CommandList>
              <CommandEmpty className="p-0">
                {isLoading ? (
                  <div className="p-2">
                    {Array.from({ length: options.length }).map((_, i) => (
                      <Skeleton className="mb-1 h-4 w-full last:mb-0" key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">{'No items found.'}</div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    className={cn(
                      'group/item',
                      isSelected(option.value) && !canUnselect ? 'cursor-default' : 'cursor-pointer',
                    )}
                    key={option.value}
                    onSelect={onSelect(option.value)}
                    value={option.value}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        isSelected(option.value) ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-30',
                      )}
                    />
                    <div className="flex items-center gap-1.5">
                      {option.icon && <span className="">{option.icon}</span>}
                      {option.label}
                    </div>
                  </CommandItem>
                ))}
                <CommandSeparator />
                <CommandItem className="cursor-pointer" disabled={isAllSelected} onSelect={onSelectAll} value="all">
                  {tCommon('selectAll')}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
