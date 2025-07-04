import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { CaretDownIcon, CheckIcon } from '@radix-ui/react-icons'
import type { Editor } from '@tiptap/react'
import type { VariantProps } from 'class-variance-authority'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToolbarButton } from '@/components/ui/rich-text-editor/components/toolbar-button'
import type { toggleVariants } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/hooks/use-theme'

interface ColorItem {
  cssVar: string
  label: string
  darkLabel?: string
}

interface ColorPalette {
  label: string
  colors: ColorItem[]
  inverse: string
}

const COLORS: ColorPalette[] = [
  {
    label: 'Palette 1',
    inverse: 'hsl(var(--background))',
    colors: [
      { cssVar: 'hsl(var(--foreground))', label: 'Default' },
      { cssVar: 'var(--mt-accent-bold-blue)', label: 'Bold blue' },
      { cssVar: 'var(--mt-accent-bold-teal)', label: 'Bold teal' },
      { cssVar: 'var(--mt-accent-bold-green)', label: 'Bold green' },
      { cssVar: 'var(--mt-accent-bold-orange)', label: 'Bold orange' },
      { cssVar: 'var(--mt-accent-bold-red)', label: 'Bold red' },
      { cssVar: 'var(--mt-accent-bold-purple)', label: 'Bold purple' },
    ],
  },
  {
    label: 'Palette 2',
    inverse: 'hsl(var(--background))',
    colors: [
      { cssVar: 'var(--mt-accent-gray)', label: 'Gray' },
      { cssVar: 'var(--mt-accent-blue)', label: 'Blue' },
      { cssVar: 'var(--mt-accent-teal)', label: 'Teal' },
      { cssVar: 'var(--mt-accent-green)', label: 'Green' },
      { cssVar: 'var(--mt-accent-orange)', label: 'Orange' },
      { cssVar: 'var(--mt-accent-red)', label: 'Red' },
      { cssVar: 'var(--mt-accent-purple)', label: 'Purple' },
    ],
  },
  {
    label: 'Palette 3',
    inverse: 'hsl(var(--foreground))',
    colors: [
      { cssVar: 'hsl(var(--background))', label: 'White', darkLabel: 'Black' },
      { cssVar: 'var(--mt-accent-blue-subtler)', label: 'Blue subtle' },
      { cssVar: 'var(--mt-accent-teal-subtler)', label: 'Teal subtle' },
      { cssVar: 'var(--mt-accent-green-subtler)', label: 'Green subtle' },
      { cssVar: 'var(--mt-accent-yellow-subtler)', label: 'Yellow subtle' },
      { cssVar: 'var(--mt-accent-red-subtler)', label: 'Red subtle' },
      { cssVar: 'var(--mt-accent-purple-subtler)', label: 'Purple subtle' },
    ],
  },
]

const MemoizedColorButton = memo<{
  color: ColorItem
  isSelected: boolean
  inverse: string
  onClick: (value: string) => void
}>(({ color, inverse, isSelected, onClick }) => {
  const { isDarkMode } = useTheme()
  const label = useMemo(
    () => (isDarkMode && color.darkLabel ? color.darkLabel : color.label),
    [color.darkLabel, color.label, isDarkMode],
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ToggleGroupItem
          aria-label={label}
          className="relative size-7 rounded-md p-0"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            onClick(color.cssVar)
          }}
          style={{ backgroundColor: color.cssVar }}
          tabIndex={0}
          value={color.cssVar}
        >
          {isSelected && <CheckIcon className="absolute inset-0 m-auto size-6" style={{ color: inverse }} />}
        </ToggleGroupItem>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
})

const MemoizedColorPicker = memo<{
  palette: ColorPalette
  selectedColor: string
  inverse: string
  onColorChange: (value: string) => void
}>(({ inverse, onColorChange, palette, selectedColor }) => (
  <ToggleGroup
    className="gap-1.5"
    onValueChange={(value: string) => {
      if (value) onColorChange(value)
    }}
    type="single"
    value={selectedColor}
  >
    {palette.colors.map((color, index) => (
      <MemoizedColorButton
        color={color}
        inverse={inverse}
        isSelected={selectedColor === color.cssVar}
        key={index}
        onClick={onColorChange}
      />
    ))}
  </ToggleGroup>
))

export interface SectionThreeProps extends VariantProps<typeof toggleVariants> {
  editor: Editor
}

export const SectionThree: React.FC<SectionThreeProps> = ({ editor, size, variant }) => {
  const color = (editor.getAttributes('textStyle')?.color as string) || 'hsl(var(--foreground))'
  const [selectedColor, setSelectedColor] = useState(color)

  const handleColorChange = useCallback(
    (value: string) => {
      setSelectedColor(value)
      editor.chain().setColor(value).run()
    },
    [editor],
  )

  useEffect(() => {
    setSelectedColor(color)
  }, [color])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ToolbarButton aria-label="Text color" className="w-12" size={size} tooltip="Text color" variant={variant}>
          <svg
            className="size-5"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            style={{ color: selectedColor }}
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 20h16" />
            <path d="m6 16 6-12 6 12" />
            <path d="M8 12h8" />
          </svg>
          <CaretDownIcon className="size-5" />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full">
        <div className="space-y-1.5">
          {COLORS.map((palette, index) => (
            <MemoizedColorPicker
              inverse={palette.inverse}
              key={index}
              onColorChange={handleColorChange}
              palette={palette}
              selectedColor={selectedColor}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
