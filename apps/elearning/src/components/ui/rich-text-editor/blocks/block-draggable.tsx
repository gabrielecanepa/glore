'use client'

import { memo, useEffect, useMemo, useState } from 'react'

import { DndPlugin, useDraggable, useDropLine } from '@platejs/dnd'
import { BlockSelectionPlugin } from '@platejs/selection/react'
import { GripVertical } from 'lucide-react'
import { isType, KEYS, type TElement } from 'platejs'
import {
  MemoizedChildren,
  useEditorRef,
  useElement,
  usePluginOption,
  useSelected,
  type PlateEditor,
  type PlateElementProps,
  type RenderNodeWrapper,
} from 'platejs/react'

import { Button } from '@/components/ui/button'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'

const UNDRAGGABLE_KEYS = [KEYS.column, KEYS.tr, KEYS.td]

export const BlockDraggable: RenderNodeWrapper = props => {
  const { editor, element, path } = props

  const enabled = useMemo(() => {
    if (editor.dom.readOnly) return false
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) return true
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.column),
        },
      })
      if (block) return true
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.table),
        },
      })
      if (block) return true
    }
    return false
  }, [editor, element, path])

  if (!enabled) return

  return props => <Draggable {...props} />
}

const Draggable = (props: PlateElementProps) => {
  const { editor, element, path } = props
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection

  const { handleRef, isDragging, nodeRef, previewRef } = useDraggable({
    element,
    onDropHandler: (_, { dragItem }) => {
      const id = (dragItem as { id: string[] | string }).id
      if (blockSelectionApi) blockSelectionApi.add(id)
      resetPreview()
    },
  })

  const isInColumn = path.length === 3
  const isInTable = path.length === 4

  const [previewTop, setPreviewTop] = useState(0)

  const resetPreview = () => {
    if (previewRef.current) {
      previewRef.current.replaceChildren()
    }
  }

  useEffect(() => {
    if (isDragging) return
    resetPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  const [dragButtonTop, setDragButtonTop] = useState(0)

  return (
    <div
      className={cn('group/container relative', isDragging && 'opacity-50')}
      onMouseEnter={() => {
        if (isDragging) return
        setDragButtonTop(calcDragButtonTop(editor, element))
      }}
    >
      {!isInTable && (
        <Gutter>
          <div className={cn('slate-blockToolbarWrapper flex h-[1.5em]', isInColumn && 'h-4')}>
            <div
              className={cn(
                'slate-blockToolbar pointer-events-auto relative mr-1 flex w-4.5 items-center',
                isInColumn && 'mr-1.5',
              )}
            >
              <Button
                className="absolute -left-0 h-6 w-full p-0"
                data-plate-prevent-deselect
                ref={handleRef}
                style={{ top: `${dragButtonTop + 3}px` }}
                variant="ghost"
              >
                <DragHandle isDragging={isDragging} previewRef={previewRef} setPreviewTop={setPreviewTop} />
              </Button>
            </div>
          </div>
        </Gutter>
      )}

      <div
        className={cn('absolute -left-0 hidden w-full')}
        contentEditable={false}
        ref={previewRef}
        style={{ top: `${-previewTop}px` }}
      />

      <div className="slate-blockWrapper flow-root" ref={nodeRef}>
        <MemoizedChildren>{props.children}</MemoizedChildren>
        <DropLine />
      </div>
    </div>
  )
}

const Gutter = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  const isSelectionAreaVisible = usePluginOption(BlockSelectionPlugin, 'isSelectionAreaVisible')
  const selected = useSelected()

  return (
    <div
      {...props}
      className={cn(
        `
          slate-gutterLeft group/gutter-left absolute top-0 z-50 flex h-full -translate-x-full cursor-text
          group-hover/container:opacity-100
          sm:opacity-0
        `,
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        className,
      )}
      contentEditable={false}
      data-selected={selected}
    >
      {children}
    </div>
  )
}

const DragHandle = memo(
  ({
    isDragging,
    previewRef,
    setPreviewTop,
  }: {
    isDragging: boolean
    previewRef: React.RefObject<HTMLDivElement | null>
    setPreviewTop: (top: number) => void
  }) => {
    const editor = useEditorRef()
    const element = useElement()
    const t = useTranslations('Editor.actions')

    return (
      <div
        className="flex size-full items-center justify-center"
        onClick={() => {
          editor.getApi(BlockSelectionPlugin).blockSelection.set(element.id as string)
        }}
        onMouseDown={e => {
          if (e.button !== 0 || e.shiftKey) return

          const elements = createDragPreviewElements(editor, { currentBlock: element })
          previewRef.current?.append(...elements)
          previewRef.current?.classList.remove('hidden')
          editor.setOption(DndPlugin, 'multiplePreviewRef', previewRef)
        }}
        onMouseEnter={() => {
          if (isDragging) return
          const blockSelection = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes({ sort: true })
          const selectedBlocks = blockSelection.length > 0 ? blockSelection : editor.api.blocks({ mode: 'highest' })
          const ids = selectedBlocks.map(block => block[0].id as string)
          if (ids.length > 1 && ids.includes(element.id as string)) {
            const previewTop = calculatePreviewTop(editor, {
              blocks: selectedBlocks.map(block => block[0]),
              element,
            })
            setPreviewTop(previewTop)
            return
          }
          setPreviewTop(0)
        }}
        role="button"
        title={t('dragToMove')}
      >
        <GripVertical className="text-muted-foreground" />
      </div>
    )
  },
)

const DropLine = memo(({ className, ...props }: React.ComponentProps<'div'>) => {
  const { dropLine } = useDropLine()

  if (!dropLine) return null

  return (
    <div
      {...props}
      className={cn(
        'slate-dropLine absolute inset-x-0 h-0.5 bg-brand/50 opacity-100 transition-opacity',
        dropLine === 'top' && '-top-px',
        dropLine === 'bottom' && '-bottom-px',
        className,
      )}
    />
  )
})

const createDragPreviewElements = (
  editor: PlateEditor,
  { currentBlock }: { currentBlock: TElement },
): HTMLElement[] => {
  const blockSelection = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes({ sort: true })

  const selectionNodes = blockSelection.length > 0 ? blockSelection : editor.api.blocks({ mode: 'highest' })

  const includes = selectionNodes.some(([node]) => node.id === currentBlock.id)

  const sortedNodes = includes ? selectionNodes.map(([node]) => node) : [currentBlock]

  if (blockSelection.length === 0) {
    editor.tf.blur()
    editor.tf.collapse()
  }

  const elements: HTMLElement[] = []
  const ids: string[] = []

  // Remove data attributes from the element to avoid recognizing slate elements incorrectly.
  const removeDataAttributes = (element: HTMLElement) => {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-slate') || attr.name.startsWith('data-block-id')) {
        element.removeAttribute(attr.name)
      }
    })

    Array.from(element.children).forEach(child => {
      removeDataAttributes(child as HTMLElement)
    })
  }

  const resolveElement = (node: TElement, index: number) => {
    const domNode = editor.api.toDOMNode(node)!

    const newDomNode = domNode.cloneNode(true) as HTMLElement

    ids.push(node.id as string)
    const wrapper = document.createElement('div')
    wrapper.append(newDomNode)
    wrapper.style.display = 'flow-root'

    const lastDomNode = sortedNodes[index - 1]

    if (lastDomNode) {
      const lastDomNodeRect = editor.api.toDOMNode(lastDomNode)!.parentElement!.getBoundingClientRect()

      const domNodeRect = domNode.parentElement!.getBoundingClientRect()

      const distance = domNodeRect.top - lastDomNodeRect.bottom

      if (distance > 15) {
        wrapper.style.marginTop = `${distance}px`
      }
    }

    removeDataAttributes(newDomNode)
    elements.push(wrapper)
  }

  sortedNodes.forEach((node, index) => resolveElement(node, index))

  editor.setOption(DndPlugin, 'draggingId', ids)

  return elements
}

const calculatePreviewTop = (
  editor: PlateEditor,
  {
    blocks,
    element,
  }: {
    blocks: TElement[]
    element: TElement
  },
): number => {
  const child = editor.api.toDOMNode(element)!
  const editable = editor.api.toDOMNode(editor)!
  const firstSelectedChild = blocks[0]

  const firstDomNode = editor.api.toDOMNode(firstSelectedChild)!
  const editorPaddingTop = Number(window.getComputedStyle(editable).paddingTop.replace('px', ''))

  const firstNodeToEditorDistance =
    firstDomNode.getBoundingClientRect().top - editable.getBoundingClientRect().top - editorPaddingTop

  const firstMarginTopString = window.getComputedStyle(firstDomNode).marginTop
  const marginTop = Number(firstMarginTopString.replace('px', ''))

  const currentToEditorDistance =
    child.getBoundingClientRect().top - editable.getBoundingClientRect().top - editorPaddingTop

  const currentMarginTopString = window.getComputedStyle(child).marginTop
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''))

  const previewElementsTopDistance = currentToEditorDistance - firstNodeToEditorDistance + marginTop - currentMarginTop

  return previewElementsTopDistance
}

const calcDragButtonTop = (editor: PlateEditor, element: TElement): number => {
  const child = editor.api.toDOMNode(element)!

  const currentMarginTopString = window.getComputedStyle(child).marginTop
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''))

  return currentMarginTop
}
