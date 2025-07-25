'use client'

import { useCallback, useState } from 'react'

import { useDraggable, useDropLine } from '@platejs/dnd'
import { BlockSelectionPlugin, useBlockSelected } from '@platejs/selection/react'
import { setCellBackground } from '@platejs/table'
import {
  TablePlugin,
  TableProvider,
  useTableBordersDropdownMenuContentState,
  useTableCellElement,
  useTableCellElementResizable,
  useTableElement,
  useTableMergeState,
} from '@platejs/table/react'
import type * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { PopoverAnchor } from '@radix-ui/react-popover'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CombineIcon,
  EraserIcon,
  Grid2X2Icon,
  GripVertical,
  PaintBucketIcon,
  SquareSplitHorizontalIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import {
  KEYS,
  PathApi,
  type TElement,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from 'platejs'
import {
  PlateElement,
  useComposedRef,
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  useElementSelector,
  usePluginOption,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
  withHOC,
  type PlateElementProps,
} from 'platejs/react'

import { type Any, type AnyRecord } from '@repo/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'
import { blockSelectionVariants } from '#rte/blocks/block-selection'
import { ColorDropdownMenuItems, useColors } from '#rte/blocks/font-color-toolbar-button'
import { ResizeHandle } from '#rte/blocks/resize-handle'
import {
  BorderAllIcon,
  BorderBottomIcon,
  BorderLeftIcon,
  BorderNoneIcon,
  BorderRightIcon,
  BorderTopIcon,
} from '#rte/blocks/table-icons'
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarMenuGroup } from '#rte/blocks/toolbar'
export const TableElement = withHOC(TableProvider, ({ children, ...props }: PlateElementProps<TTableElement>) => {
  const readOnly = useReadOnly()
  const isSelectionAreaVisible = usePluginOption(BlockSelectionPlugin, 'isSelectionAreaVisible')
  const hasControls = !readOnly && !isSelectionAreaVisible
  const { isSelectingCell, marginLeft, props: tableProps } = useTableElement()

  const isSelectingTable = useBlockSelected(props.element.id as string) as boolean

  const content = (
    <PlateElement
      {...props}
      className={cn('overflow-x-auto py-5', hasControls && '-ml-2 *:data-[slot=block-selection]:left-2')}
      style={{ paddingLeft: marginLeft }}
    >
      <div className="group/table relative w-fit">
        <table
          className={cn(
            'mr-0 ml-px table h-px table-fixed border-collapse',
            isSelectingCell && 'selection:bg-transparent',
          )}
          {...tableProps}
        >
          <tbody className="min-w-full">{children}</tbody>
        </table>

        {isSelectingTable && <div className={blockSelectionVariants()} contentEditable={false} />}
      </div>
    </PlateElement>
  )

  if (readOnly) {
    return content
  }

  return <TableFloatingToolbar>{content}</TableFloatingToolbar>
})

const TableFloatingToolbar = ({ children, ...props }: React.ComponentProps<typeof PopoverContent>) => {
  const { tf } = useEditorPlugin(TablePlugin)
  const selected = useSelected()
  const element = useElement<TTableElement>()
  const { props: buttonProps } = useRemoveNodeButton({ element })
  const collapsedInside = useEditorSelector(editor => selected && editor.api.isCollapsed(), [selected])
  const t = useTranslations('Editor.blocks')

  const { canMerge, canSplit } = useTableMergeState()

  return (
    <Popover modal={false} open={canMerge || canSplit || collapsedInside}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent asChild contentEditable={false} onOpenAutoFocus={e => e.preventDefault()} {...props}>
        <Toolbar
          className="scrollbar-hide flex w-auto max-w-[80vw] flex-row overflow-x-auto rounded-md border bg-popover p-1 shadow-md print:hidden"
          contentEditable={false}
        >
          <ToolbarGroup>
            <ColorDropdownMenu tooltip={t('tableBackgroundColor')}>
              <PaintBucketIcon />
            </ColorDropdownMenu>
            {canMerge && (
              <ToolbarButton
                onClick={() => tf.table.merge()}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableMerge')}
              >
                <CombineIcon />
              </ToolbarButton>
            )}
            {canSplit && (
              <ToolbarButton
                onClick={() => tf.table.split()}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableSplit')}
              >
                <SquareSplitHorizontalIcon />
              </ToolbarButton>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <ToolbarButton tooltip={t('tableCellBorders')}>
                  <Grid2X2Icon />
                </ToolbarButton>
              </DropdownMenuTrigger>

              <DropdownMenuPortal>
                <TableBordersDropdownMenuContent />
              </DropdownMenuPortal>
            </DropdownMenu>

            {collapsedInside && (
              <ToolbarGroup>
                <ToolbarButton tooltip={t('tableDelete')} {...buttonProps}>
                  <Trash2Icon />
                </ToolbarButton>
              </ToolbarGroup>
            )}
          </ToolbarGroup>

          {collapsedInside && (
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableRow({ before: true })
                }}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableInsertRowBefore')}
              >
                <ArrowUp />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableRow()
                }}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableInsertRowAfter')}
              >
                <ArrowDown />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.remove.tableRow()
                }}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableDeleteRow')}
              >
                <XIcon />
              </ToolbarButton>
            </ToolbarGroup>
          )}

          {collapsedInside && (
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableColumn({ before: true })
                }}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableInsertColumnBefore')}
              >
                <ArrowLeft />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableColumn()
                }}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableInsertColumnAfter')}
              >
                <ArrowRight />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.remove.tableColumn()
                }}
                onMouseDown={e => e.preventDefault()}
                tooltip={t('tableDeleteColumn')}
              >
                <XIcon />
              </ToolbarButton>
            </ToolbarGroup>
          )}
        </Toolbar>
      </PopoverContent>
    </Popover>
  )
}

const TableBordersDropdownMenuContent = (props: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => {
  const editor = useEditorRef()
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState()

  return (
    <DropdownMenuContent
      align="start"
      className="min-w-[220px]"
      onCloseAutoFocus={e => {
        e.preventDefault()
        editor.tf.focus()
      }}
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem checked={hasTopBorder} onCheckedChange={getOnSelectTableBorder('top')}>
          <BorderTopIcon />
          <div>{'Top Border'}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={hasRightBorder} onCheckedChange={getOnSelectTableBorder('right')}>
          <BorderRightIcon />
          <div>{'Right Border'}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={hasBottomBorder} onCheckedChange={getOnSelectTableBorder('bottom')}>
          <BorderBottomIcon />
          <div>{'Bottom Border'}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={hasLeftBorder} onCheckedChange={getOnSelectTableBorder('left')}>
          <BorderLeftIcon />
          <div>{'Left Border'}</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem checked={hasNoBorders} onCheckedChange={getOnSelectTableBorder('none')}>
          <BorderNoneIcon />
          <div>{'No Border'}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={hasOuterBorders} onCheckedChange={getOnSelectTableBorder('outer')}>
          <BorderAllIcon />
          <div>{'Outside Borders'}</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}

const ColorDropdownMenu = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => {
  const [open, setOpen] = useState(false)
  const { colors } = useColors()

  const editor = useEditorRef()
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells')

  const onUpdateColor = useCallback(
    (color: string) => {
      setOpen(false)
      setCellBackground(editor, { color, selectedCells: selectedCells ?? [] })
    },
    [selectedCells, editor],
  )

  const onClearColor = useCallback(() => {
    setOpen(false)
    setCellBackground(editor, {
      color: null,
      selectedCells: selectedCells ?? [],
    })
  }, [selectedCells, editor])

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip}>{children}</ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ToolbarMenuGroup label="Colors">
          <ColorDropdownMenuItems className="px-2" colors={colors} updateColor={onUpdateColor} />
        </ToolbarMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2" onClick={onClearColor}>
            <EraserIcon />
            <span>{'Clear'}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const TableRowElement = (props: PlateElementProps<TTableRowElement>) => {
  const { element } = props
  const readOnly = useReadOnly()
  const selected = useSelected()
  const editor = useEditorRef()
  const isSelectionAreaVisible = usePluginOption(BlockSelectionPlugin, 'isSelectionAreaVisible')
  const hasControls = !readOnly && !isSelectionAreaVisible

  const { handleRef, isDragging, previewRef } = useDraggable({
    element,
    type: element.type,
    canDropNode: ({ dragEntry, dropEntry }) =>
      PathApi.equals(PathApi.parent(dragEntry[1]), PathApi.parent(dropEntry[1])),
    onDropHandler: (_, { dragItem }) => {
      const dragElement = (dragItem as { element: TElement }).element

      if (dragElement) {
        editor.tf.select(dragElement)
      }
    },
  })

  return (
    <PlateElement
      {...props}
      as="tr"
      attributes={{
        ...props.attributes,
        'data-selected': selected ? 'true' : undefined,
      }}
      className={cn('group/row', isDragging && 'opacity-50')}
      ref={useComposedRef(props.ref as React.Ref<AnyRecord>, previewRef)}
    >
      {hasControls && (
        <td className="w-2 select-none" contentEditable={false}>
          <RowDragHandle dragRef={handleRef} />
          <RowDropLine />
        </td>
      )}

      {props.children}
    </PlateElement>
  )
}

const RowDragHandle = ({ dragRef }: { dragRef: React.Ref<Any> }) => {
  const editor = useEditorRef()
  const element = useElement()

  return (
    <Button
      className={cn(
        'absolute top-1/2 left-0 z-51 h-6 w-4 -translate-y-1/2 p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        'cursor-grab active:cursor-grabbing',
        'opacity-0 transition-opacity duration-100 group-hover/row:opacity-100 group-has-data-[resizing="true"]/row:opacity-0',
      )}
      onClick={() => {
        editor.tf.select(element)
      }}
      ref={dragRef}
      variant="outline"
    >
      <GripVertical className="text-muted-foreground" />
    </Button>
  )
}

const RowDropLine = () => {
  const { dropLine } = useDropLine()

  if (!dropLine) return null

  return (
    <div
      className={cn('absolute inset-x-0 left-2 z-50 h-0.5 bg-brand/50', dropLine === 'top' ? '-top-px' : '-bottom-px')}
    />
  )
}

export const TableCellElement = ({
  isHeader,
  ...props
}: PlateElementProps<TTableCellElement> & {
  isHeader?: boolean
}) => {
  const { api } = useEditorPlugin(TablePlugin)
  const readOnly = useReadOnly()
  const element = props.element

  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: KEYS.tr,
  })
  const isSelectingRow = useBlockSelected(rowId) as boolean
  const isSelectionAreaVisible = usePluginOption(BlockSelectionPlugin, 'isSelectionAreaVisible')

  const { borders, colIndex, colSpan, minHeight, rowIndex, selected, width } = useTableCellElement()

  const { bottomProps, hiddenLeft, leftProps, rightProps } = useTableCellElementResizable({
    colIndex,
    colSpan,
    rowIndex,
  })

  return (
    <PlateElement
      {...props}
      as={isHeader ? 'th' : 'td'}
      attributes={{
        ...props.attributes,
        colSpan: api.table.getColSpan(element),
        rowSpan: api.table.getRowSpan(element),
      }}
      className={cn(
        'h-full overflow-visible border-none bg-background p-0',
        element.background ? 'bg-(--cellBackground)' : 'bg-background',
        isHeader && 'text-left *:m-0',
        'before:size-full',
        selected && 'before:z-10 before:bg-brand/5',
        "before:absolute before:box-border before:content-[''] before:select-none",
        borders.bottom?.size && 'before:border-b before:border-b-border',
        borders.right?.size && 'before:border-r before:border-r-border',
        borders.left?.size && 'before:border-l before:border-l-border',
        borders.top?.size && 'before:border-t before:border-t-border',
      )}
      style={
        {
          '--cellBackground': element.background,
          maxWidth: width || 240,
          minWidth: width || 120,
        } as React.CSSProperties
      }
    >
      <div className="relative z-20 box-border h-full px-3 py-2" style={{ minHeight }}>
        {props.children}
      </div>

      {!isSelectionAreaVisible && (
        <div
          className="group absolute top-0 size-full select-none"
          contentEditable={false}
          suppressContentEditableWarning={true}
        >
          {!readOnly && (
            <>
              <ResizeHandle {...rightProps} className="-top-2 -right-1 h-[calc(100%_+_8px)] w-2" data-col={colIndex} />
              <ResizeHandle {...bottomProps} className="-bottom-1 h-2" />
              {!hiddenLeft && (
                <ResizeHandle
                  {...leftProps}
                  className="top-0 -left-1 w-2"
                  data-resizer-left={colIndex === 0 ? 'true' : undefined}
                />
              )}

              <div
                className={cn(
                  'absolute top-0 z-30 hidden h-full w-1 bg-ring',
                  'right-[-1.5px]',
                  columnResizeVariants({ colIndex: colIndex as VariantProps<typeof columnResizeVariants>['colIndex'] }),
                )}
              />
              {colIndex === 0 && (
                <div
                  className={cn(
                    'absolute top-0 z-30 h-full w-1 bg-ring',
                    'left-[-1.5px]',
                    `
                      hidden animate-in fade-in
                      group-has-[[data-resizer-left]:hover]/table:block
                      group-has-[[data-resizer-left][data-resizing="true"]]/table:block
                    `,
                  )}
                />
              )}
            </>
          )}
        </div>
      )}

      {isSelectingRow && <div className={blockSelectionVariants()} contentEditable={false} />}
    </PlateElement>
  )
}

export const TableCellHeaderElement = (props: React.ComponentProps<typeof TableCellElement>) => (
  <TableCellElement {...props} isHeader />
)

const columnResizeVariants = cva('hidden animate-in fade-in', {
  variants: {
    colIndex: {
      0: 'group-has-[[data-col="0"]:hover]/table:block group-has-[[data-col="0"][data-resizing="true"]]/table:block',
      1: 'group-has-[[data-col="1"]:hover]/table:block group-has-[[data-col="1"][data-resizing="true"]]/table:block',
      2: 'group-has-[[data-col="2"]:hover]/table:block group-has-[[data-col="2"][data-resizing="true"]]/table:block',
      3: 'group-has-[[data-col="3"]:hover]/table:block group-has-[[data-col="3"][data-resizing="true"]]/table:block',
      4: 'group-has-[[data-col="4"]:hover]/table:block group-has-[[data-col="4"][data-resizing="true"]]/table:block',
      5: 'group-has-[[data-col="5"]:hover]/table:block group-has-[[data-col="5"][data-resizing="true"]]/table:block',
      6: 'group-has-[[data-col="6"]:hover]/table:block group-has-[[data-col="6"][data-resizing="true"]]/table:block',
      7: 'group-has-[[data-col="7"]:hover]/table:block group-has-[[data-col="7"][data-resizing="true"]]/table:block',
      8: 'group-has-[[data-col="8"]:hover]/table:block group-has-[[data-col="8"][data-resizing="true"]]/table:block',
      9: 'group-has-[[data-col="9"]:hover]/table:block group-has-[[data-col="9"][data-resizing="true"]]/table:block',
      10: 'group-has-[[data-col="10"]:hover]/table:block group-has-[[data-col="10"][data-resizing="true"]]/table:block',
    },
  },
})
