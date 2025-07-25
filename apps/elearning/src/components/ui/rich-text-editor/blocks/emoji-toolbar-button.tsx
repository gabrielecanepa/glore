'use client'

import { memo, useCallback, useMemo } from 'react'

import type { Emoji } from '@emoji-mart/data'
import en from '@emoji-mart/data/i18n/en.json'
import es from '@emoji-mart/data/i18n/es.json'
import it from '@emoji-mart/data/i18n/it.json'
import { EmojiSettings, type EmojiCategoryList, type EmojiIconList, type GridRow } from '@platejs/emoji'
import { useEmojiDropdownMenuState, type EmojiDropdownMenuOptions, type UseEmojiPickerType } from '@platejs/emoji/react'
import * as Popover from '@radix-ui/react-popover'
import {
  AppleIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  LeafIcon,
  LightbulbIcon,
  MusicIcon,
  SearchIcon,
  SmileIcon,
  StarIcon,
  XIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'
import { ToolbarButton } from '#rte/blocks/toolbar'

const I18N_DATA = { en, es, it }

export const EmojiToolbarButton = ({
  options,
  ...props
}: {
  options?: EmojiDropdownMenuOptions
} & React.ComponentPropsWithoutRef<typeof ToolbarButton>) => {
  const { emojiPickerState, isOpen, setIsOpen } = useEmojiDropdownMenuState(options)
  const t = useTranslations('Editor.blocks')

  return (
    <EmojiPopover
      control={
        <ToolbarButton isDropdown pressed={isOpen} tooltip={t('emoji')} {...props}>
          <SmileIcon />
        </ToolbarButton>
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <EmojiPicker {...emojiPickerState} isOpen={isOpen} setIsOpen={setIsOpen} settings={options?.settings} />
    </EmojiPopover>
  )
}

export const EmojiPopover = ({
  children,
  control,
  isOpen,
  setIsOpen,
}: {
  children: React.ReactNode
  control: React.ReactNode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) => (
  <Popover.Root onOpenChange={setIsOpen} open={isOpen}>
    <Popover.Trigger asChild>{control}</Popover.Trigger>
    <Popover.Portal>
      <Popover.Content className="z-100">{children}</Popover.Content>
    </Popover.Portal>
  </Popover.Root>
)

export const EmojiPicker = ({
  clearSearch,
  emoji,
  emojiLibrary,
  focusedCategory,
  handleCategoryClick,
  hasFound,
  icons = {
    categories: emojiCategoryIcons,
    search: emojiSearchIcons,
  },
  isSearching,
  onMouseOver,
  onSelectEmoji,
  refs,
  searchResult,
  searchValue,
  setSearch,
  settings = EmojiSettings,
  visibleCategories,
}: Omit<UseEmojiPickerType, 'icons'> & {
  icons?: EmojiIconList<React.ReactElement>
}) => {
  const { locale } = useLocale()
  const t = useTranslations('Editor.emoji')

  const i18n = useMemo(
    () => ({
      ...(I18N_DATA[locale] || I18N_DATA.en),
      clear: t('clear'),
      searchNoResultsTitle: t('searchNoResultsTitle'),
      searchNoResultsSubtitle: t('searchNoResultsSubtitle'),
      searchResult: t('searchResult'),
    }),
    [locale, t],
  )

  return (
    <div
      className={cn('flex flex-col rounded-xl bg-popover text-popover-foreground', 'h-[23rem] w-80 border shadow-md')}
    >
      <EmojiPickerNavigation
        emojiLibrary={emojiLibrary}
        focusedCategory={focusedCategory}
        i18n={i18n}
        icons={icons}
        onClick={handleCategoryClick}
      />
      <EmojiPickerSearchBar i18n={i18n} searchValue={searchValue} setSearch={setSearch}>
        <EmojiPickerSearchAndClear clearSearch={clearSearch} i18n={i18n} searchValue={searchValue} />
      </EmojiPickerSearchBar>
      <EmojiPickerContent
        emojiLibrary={emojiLibrary}
        i18n={i18n}
        isSearching={isSearching}
        onMouseOver={onMouseOver}
        onSelectEmoji={onSelectEmoji}
        refs={refs}
        searchResult={searchResult}
        settings={settings}
        visibleCategories={visibleCategories}
      />
      <EmojiPickerPreview emoji={emoji} hasFound={hasFound} i18n={i18n} isSearching={isSearching} />
    </div>
  )
}

const EmojiButton = memo(
  ({
    emoji,
    index,
    onMouseOver,
    onSelect,
  }: {
    emoji: Emoji
    index: number
    onMouseOver: (emoji?: Emoji) => void
    onSelect: (emoji: Emoji) => void
  }) => (
    <button
      aria-label={emoji.skins[0].native}
      className="group relative flex size-9 cursor-pointer items-center justify-center border-none bg-transparent text-2xl leading-none"
      data-index={index}
      onClick={() => onSelect(emoji)}
      onMouseEnter={() => onMouseOver(emoji)}
      onMouseLeave={() => onMouseOver()}
      tabIndex={-1}
      type="button"
    >
      <div aria-hidden="true" className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100" />
      <span
        className="relative"
        data-emoji-set="native"
        style={{
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
        }}
      >
        {emoji.skins[0].native}
      </span>
    </button>
  ),
)

const RowOfButtons = memo(
  ({
    emojiLibrary,
    onMouseOver,
    onSelectEmoji,
    row,
  }: {
    row: GridRow
  } & Pick<UseEmojiPickerType, 'emojiLibrary' | 'onMouseOver' | 'onSelectEmoji'>) => (
    <div className="flex" data-index={row.id} key={row.id}>
      {row.elements.map((emojiId, index) => (
        <EmojiButton
          emoji={emojiLibrary.getEmoji(emojiId)}
          index={index}
          key={emojiId}
          onMouseOver={onMouseOver}
          onSelect={onSelectEmoji}
        />
      ))}
    </div>
  ),
)

const EmojiPickerContent = ({
  emojiLibrary,
  i18n,
  isSearching = false,
  onMouseOver,
  onSelectEmoji,
  refs,
  searchResult,
  settings = EmojiSettings,
  visibleCategories,
}: Pick<
  UseEmojiPickerType,
  | 'emojiLibrary'
  | 'i18n'
  | 'isSearching'
  | 'onMouseOver'
  | 'onSelectEmoji'
  | 'refs'
  | 'searchResult'
  | 'settings'
  | 'visibleCategories'
>) => {
  const getRowWidth = settings.perLine.value * settings.buttonSize.value

  const isCategoryVisible = useCallback(
    (categoryId: EmojiCategoryList) => (visibleCategories.has(categoryId) ? visibleCategories.get(categoryId) : false),
    [visibleCategories],
  )

  const EmojiList = useCallback(
    () =>
      emojiLibrary
        .getGrid()
        .sections()
        .map(({ id: categoryId }) => {
          const section = emojiLibrary.getGrid().section(categoryId)
          const { buttonSize } = settings

          return (
            <div data-id={categoryId} key={categoryId} ref={section.root} style={{ width: getRowWidth }}>
              <div className="sticky -top-px z-1 bg-popover/90 p-1 py-2 text-sm font-semibold backdrop-blur-xs">
                {i18n.categories[categoryId]}
              </div>
              <div className="relative flex flex-wrap" style={{ height: section.getRows().length * buttonSize.value }}>
                {isCategoryVisible(categoryId) &&
                  section
                    .getRows()
                    .map((row: GridRow) => (
                      <RowOfButtons
                        emojiLibrary={emojiLibrary}
                        key={row.id}
                        onMouseOver={onMouseOver}
                        onSelectEmoji={onSelectEmoji}
                        row={row}
                      />
                    ))}
              </div>
            </div>
          )
        }),
    [emojiLibrary, getRowWidth, i18n.categories, isCategoryVisible, onSelectEmoji, onMouseOver, settings],
  )

  const SearchList = useCallback(
    () => (
      <div data-id="search" style={{ width: getRowWidth }}>
        <div className="sticky -top-px z-1 bg-popover/90 p-1 py-2 text-sm font-semibold text-card-foreground backdrop-blur-xs">
          {i18n.searchResult}
        </div>
        <div className="relative flex flex-wrap">
          {searchResult.map((emoji: Emoji, index: number) => (
            <EmojiButton
              emoji={emojiLibrary.getEmoji(emoji.id)}
              index={index}
              key={emoji.id}
              onMouseOver={onMouseOver}
              onSelect={onSelectEmoji}
            />
          ))}
        </div>
      </div>
    ),
    [emojiLibrary, getRowWidth, i18n.searchResult, searchResult, onSelectEmoji, onMouseOver],
  )

  return (
    <div
      className={cn(
        'h-full min-h-[50%] overflow-x-hidden overflow-y-auto px-2',
        '[&::-webkit-scrollbar]:w-4',
        '[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0',
        `
          [&::-webkit-scrollbar-thumb]:min-h-11 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted
          [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/25
        `,
        `
          [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-popover
          [&::-webkit-scrollbar-thumb]:bg-clip-padding
        `,
      )}
      data-id="scroll"
      ref={refs.current.contentRoot}
    >
      <div className="h-full" ref={refs.current.content}>
        {isSearching ? SearchList() : EmojiList()}
      </div>
    </div>
  )
}

const EmojiPickerSearchBar = ({
  children,
  i18n,
  searchValue,
  setSearch,
}: {
  children: React.ReactNode
} & Pick<UseEmojiPickerType, 'i18n' | 'searchValue' | 'setSearch'>) => (
  <div className="flex items-center px-2">
    <div className="relative flex grow items-center">
      <input
        aria-label="Search"
        autoComplete="off"
        autoFocus
        className={`
          block w-full appearance-none rounded-full border-0 bg-muted px-10 py-2 text-sm outline-none
          placeholder:text-muted-foreground
          focus-visible:outline-none
        `}
        onChange={event => setSearch(event.target.value)}
        placeholder={i18n.search}
        type="text"
        value={searchValue}
      />
      {children}
    </div>
  </div>
)

const EmojiPickerSearchAndClear = ({
  clearSearch,
  i18n,
  searchValue,
}: Pick<UseEmojiPickerType, 'clearSearch' | 'i18n' | 'searchValue'>) => (
  <div className="flex items-center text-foreground">
    <div
      className={cn(
        'absolute top-1/2 left-2.5 z-10 flex size-5 -translate-y-1/2 items-center justify-center text-foreground',
      )}
    >
      {emojiSearchIcons.loupe}
    </div>
    {searchValue && (
      <Button
        aria-label="Clear"
        className={cn(
          `
            absolute top-1/2 right-0.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-transparent
            text-popover-foreground
            hover:bg-transparent
          `,
        )}
        onClick={clearSearch}
        size="icon"
        title={i18n.clear}
        type="button"
        variant="ghost"
      >
        {emojiSearchIcons.delete}
      </Button>
    )}
  </div>
)

const EmojiPreview = ({ emoji }: Pick<UseEmojiPickerType, 'emoji'>) => (
  <div className="flex h-14 max-h-14 min-h-14 items-center border-t border-muted p-2">
    <div className="flex items-center justify-center text-2xl">{emoji?.skins[0].native}</div>
    <div className="overflow-hidden pl-2">
      <div className="truncate text-sm font-semibold">{emoji?.name}</div>
      <div className="truncate text-sm">{`:${emoji?.id}:`}</div>
    </div>
  </div>
)

const NoEmoji = ({ i18n }: Pick<UseEmojiPickerType, 'i18n'>) => (
  <div className="flex h-14 max-h-14 min-h-14 items-center border-t border-muted p-2">
    <div className="flex items-center justify-center text-2xl">{'😢'}</div>
    <div className="overflow-hidden pl-2">
      <div className="truncate text-sm font-bold">{i18n.searchNoResultsTitle}</div>
      <div className="truncate text-sm">{i18n.searchNoResultsSubtitle}</div>
    </div>
  </div>
)

const PickAnEmoji = ({ i18n }: Pick<UseEmojiPickerType, 'i18n'>) => (
  <div className="flex h-14 max-h-14 min-h-14 items-center border-t border-muted p-2">
    <div className="flex items-center justify-center text-2xl">{'☝️'}</div>
    <div className="overflow-hidden pl-2">
      <div className="truncate text-sm font-semibold">{i18n.pick}</div>
    </div>
  </div>
)

const EmojiPickerPreview = ({
  emoji,
  hasFound = true,
  i18n,
  isSearching = false,
  ...props
}: Pick<UseEmojiPickerType, 'emoji' | 'hasFound' | 'i18n' | 'isSearching'>) => {
  const showPickEmoji = !emoji && (!isSearching || hasFound)
  const showNoEmoji = isSearching && !hasFound
  const showPreview = emoji && !showNoEmoji && !showNoEmoji

  return (
    <>
      {showPreview && <EmojiPreview emoji={emoji} {...props} />}
      {showPickEmoji && <PickAnEmoji i18n={i18n} {...props} />}
      {showNoEmoji && <NoEmoji i18n={i18n} {...props} />}
    </>
  )
}

const EmojiPickerNavigation = ({
  emojiLibrary,
  focusedCategory,
  i18n,
  icons,
  onClick,
}: {
  onClick: (id: EmojiCategoryList) => void
} & Pick<UseEmojiPickerType, 'emojiLibrary' | 'focusedCategory' | 'i18n' | 'icons'>) => (
  <TooltipProvider delayDuration={500}>
    <nav className="mb-2.5 border-0 border-b border-solid border-b-border p-1.5" id="emoji-nav">
      <div className="relative flex items-center justify-evenly">
        {emojiLibrary
          .getGrid()
          .sections()
          .map(({ id }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  aria-label={i18n.categories[id]}
                  className={cn(
                    'h-fit rounded-full fill-current p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground',
                    id === focusedCategory && 'pointer-events-none bg-accent fill-current text-accent-foreground',
                  )}
                  onClick={() => {
                    onClick(id)
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <span className="inline-flex size-5 items-center justify-center">{icons.categories[id].outline}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{i18n.categories[id]}</TooltipContent>
            </Tooltip>
          ))}
      </div>
    </nav>
  </TooltipProvider>
)

const emojiCategoryIcons: Record<
  EmojiCategoryList,
  {
    outline: React.ReactElement
    solid: React.ReactElement // Needed to add another solid variant - outline will be used for now
  }
> = {
  activity: {
    outline: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
    solid: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
  },

  custom: {
    outline: <StarIcon className="size-full" />,
    solid: <StarIcon className="size-full" />,
  },

  flags: {
    outline: <FlagIcon className="size-full" />,
    solid: <FlagIcon className="size-full" />,
  },

  foods: {
    outline: <AppleIcon className="size-full" />,
    solid: <AppleIcon className="size-full" />,
  },

  frequent: {
    outline: <ClockIcon className="size-full" />,
    solid: <ClockIcon className="size-full" />,
  },

  nature: {
    outline: <LeafIcon className="size-full" />,
    solid: <LeafIcon className="size-full" />,
  },

  objects: {
    outline: <LightbulbIcon className="size-full" />,
    solid: <LightbulbIcon className="size-full" />,
  },

  people: {
    outline: <SmileIcon className="size-full" />,
    solid: <SmileIcon className="size-full" />,
  },

  places: {
    outline: <CompassIcon className="size-full" />,
    solid: <CompassIcon className="size-full" />,
  },

  symbols: {
    outline: <MusicIcon className="size-full" />,
    solid: <MusicIcon className="size-full" />,
  },
}

const emojiSearchIcons = {
  delete: <XIcon className="size-4 text-current" />,
  loupe: <SearchIcon className="size-4 text-current" />,
}
