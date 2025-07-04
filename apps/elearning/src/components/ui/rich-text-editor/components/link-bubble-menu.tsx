import { useCallback, useState } from 'react'

import { BubbleMenu, type Editor } from '@tiptap/react'

import { LinkEditBlock } from '@/components/ui/rich-text-editor/components/link-edit-block'
import { LinkPopoverBlock } from '@/components/ui/rich-text-editor/components/link-popover-block'
import type { ShouldShowProps } from '@/components/ui/rich-text-editor/types'

export interface LinkBubbleMenuProps {
  editor: Editor
}

interface LinkAttributes {
  href: string
  target: string
}

export const LinkBubbleMenu: React.FC<LinkBubbleMenuProps> = ({ editor }) => {
  const [showEdit, setShowEdit] = useState(false)
  const [linkAttrs, setLinkAttrs] = useState<LinkAttributes>({ href: '', target: '' })
  const [selectedText, setSelectedText] = useState('')

  const updateLinkState = useCallback(() => {
    const { from, to } = editor.state.selection
    const { href, target } = editor.getAttributes('link') as LinkAttributes
    const text = editor.state.doc.textBetween(from, to, ' ')

    setLinkAttrs({ href, target })
    setSelectedText(text)
  }, [editor])

  const shouldShow = useCallback(
    ({ editor, from, to }: ShouldShowProps) => {
      if (from === to) {
        return false
      }
      const { href } = editor.getAttributes('link')

      if (!editor.isActive('link') || !editor.isEditable) {
        return false
      }

      if (href) {
        updateLinkState()
        return true
      }
      return false
    },
    [updateLinkState],
  )

  const handleEdit = useCallback(() => {
    setShowEdit(true)
  }, [])

  const onSetLink = useCallback(
    (url: string, text?: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .insertContent({
          type: 'text',
          text: text || url,
          marks: [
            {
              type: 'link',
              attrs: {
                href: url,
                target: openInNewTab ? '_blank' : '',
              },
            },
          ],
        })
        .setLink({ href: url, target: openInNewTab ? '_blank' : '' })
        .run()
      setShowEdit(false)
      updateLinkState()
    },
    [editor, updateLinkState],
  )

  const onUnsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setShowEdit(false)
    updateLinkState()
  }, [editor, updateLinkState])

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        placement: 'bottom-start',
        onHidden: () => setShowEdit(false),
      }}
    >
      {showEdit ? (
        <LinkEditBlock
          className="w-full min-w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
          defaultIsNewTab={linkAttrs.target === '_blank'}
          defaultText={selectedText}
          defaultUrl={linkAttrs.href}
          onSave={onSetLink}
        />
      ) : (
        <LinkPopoverBlock onClear={onUnsetLink} onEdit={handleEdit} url={linkAttrs.href} />
      )}
    </BubbleMenu>
  )
}
