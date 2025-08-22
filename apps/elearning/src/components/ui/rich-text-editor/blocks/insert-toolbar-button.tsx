'use client'

import { useMemo, useState } from 'react'

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu'
import {
  CalendarIcon,
  ChevronRightIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  SquareIcon,
  TableIcon,
} from 'lucide-react'
import { KEYS } from 'platejs'
import { useEditorRef, type PlateEditor } from 'platejs/react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTranslations } from '@/hooks/use-translations'
import { ToolbarButton, ToolbarMenuGroup } from '@rte/blocks/toolbar'
import { insertBlock, insertInlineElement } from '@rte/utils'

interface Group {
  group: string
  items: Item[]
}

interface Item {
  focusEditor?: boolean
  icon: React.ReactNode
  label?: string
  onSelect: (editor: PlateEditor, value: string) => void
  value: string
}

export const InsertToolbarButton = (props: DropdownMenuProps) => {
  const editor = useEditorRef()
  const t = useTranslations('Editor')

  const [open, setOpen] = useState(false)

  const groups = useMemo<Group[]>(
    () => [
      {
        group: t('blocks.basicBlocks'),
        items: [
          {
            icon: <PilcrowIcon />,
            label: t('blocks.paragraph'),
            value: KEYS.p,
          },
          {
            icon: <Heading1Icon />,
            label: t('blocks.heading1'),
            value: 'h1',
          },
          {
            icon: <Heading2Icon />,
            label: t('blocks.heading2'),
            value: 'h2',
          },
          {
            icon: <Heading3Icon />,
            label: t('blocks.heading3'),
            value: 'h3',
          },
          {
            icon: <TableIcon />,
            label: t('blocks.table'),
            value: KEYS.table,
          },
          {
            icon: <QuoteIcon />,
            label: t('blocks.blockquote'),
            value: KEYS.blockquote,
          },
          {
            icon: <MinusIcon />,
            label: t('blocks.horizontalRule'),
            value: KEYS.hr,
          },
        ].map(item => ({
          ...item,
          onSelect: (editor, value) => {
            insertBlock(editor, value)
          },
        })),
      },
      {
        group: t('blocks.lists'),
        items: [
          {
            icon: <ListIcon />,
            label: t('blocks.unorderedList'),
            value: KEYS.ul,
          },
          {
            icon: <ListOrderedIcon />,
            label: t('blocks.orderedList'),
            value: KEYS.ol,
          },
          {
            icon: <SquareIcon />,
            label: t('blocks.todoList'),
            value: KEYS.listTodo,
          },
          {
            icon: <ChevronRightIcon />,
            label: t('blocks.toggle'),
            value: KEYS.toggle,
          },
        ].map(item => ({
          ...item,
          onSelect: (editor, value) => {
            insertBlock(editor, value)
          },
        })),
      },
      {
        group: t('blocks.mediaEmbed'),
        items: [
          {
            icon: <ImageIcon />,
            label: t('blocks.image'),
            value: KEYS.img,
          },
          {
            icon: <FilmIcon />,
            label: t('blocks.video'),
            value: KEYS.mediaEmbed,
          },
        ].map(item => ({
          ...item,
          onSelect: (editor, value) => {
            insertBlock(editor, value)
          },
        })),
      },
      {
        group: t('blocks.inline'),
        items: [
          {
            icon: <Link2Icon />,
            label: t('blocks.link'),
            value: KEYS.link,
          },
          {
            focusEditor: true,
            icon: <CalendarIcon />,
            label: t('blocks.date'),
            value: KEYS.date,
          },
        ].map(item => ({
          ...item,
          onSelect: (editor, value) => {
            insertInlineElement(editor, value)
          },
        })),
      },
    ],
    [t],
  )

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isDropdown pressed={open} tooltip={t('actions.insert')}>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto">
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, onSelect, value }) => (
              <DropdownMenuItem
                className="min-w-[180px]"
                key={value}
                onSelect={() => {
                  onSelect(editor, value)
                  editor.tf.focus()
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
