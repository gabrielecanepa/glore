'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { AIChatPlugin, AIPlugin, useEditorChat, useLastAssistantMessage } from '@platejs/ai/react'
import { BlockSelectionPlugin, useIsSelecting } from '@platejs/selection/react'
import { Command as CommandPrimitive } from 'cmdk'
import {
  AlbumIcon,
  BadgeHelpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  FeatherIcon,
  ListEndIcon,
  ListMinusIcon,
  ListPlusIcon,
  Loader2Icon,
  PauseIcon,
  PenLineIcon,
  SmileIcon,
  WandIcon,
  XIcon,
} from 'lucide-react'
import { NodeApi, type NodeEntry, type SlateEditor } from 'platejs'
import { useEditorPlugin, useEditorRef, useHotkeys, usePluginOption, type PlateEditor } from 'platejs/react'

import { type Any } from '@repo/utils/types'

import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'
import { AIChatEditor } from '@rte/blocks/ai-chat-editor'
import { isHotkey } from '@rte/blocks/utils'
import { useChat } from '@rte/hooks/use-chat'

type EditorChatState = 'cursorCommand' | 'cursorSuggestion' | 'selectionCommand' | 'selectionSuggestion'

interface AIChatItem {
  component?: React.ComponentType<{
    menuState: EditorChatState
  }>
  filterItems?: boolean
  icon: React.ReactNode
  items?: {
    label: string
    value: string
  }[]
  label: string
  onSelect?: ({ aiEditor, editor }: { aiEditor: SlateEditor; editor: PlateEditor }) => void
  shortcut?: string
  value: string
}

interface MenuStateItems
  extends Record<
    EditorChatState,
    {
      items: ReturnType<typeof useAIChatItems>[keyof ReturnType<typeof useAIChatItems>][]
      heading?: string
    }[]
  > {}

const useAIChatItems = () => {
  const t = useTranslations('Editor')

  return {
    accept: {
      icon: <CheckIcon />,
      label: t('ai.accept'),
      value: 'accept',
      onSelect: ({ editor }) => {
        editor.getTransforms(AIChatPlugin).aiChat.accept()
        editor.tf.focus({ edge: 'end' })
      },
    },
    continueWrite: {
      icon: <PenLineIcon />,
      label: t('ai.continueWriting'),
      value: 'continueWrite',
      onSelect: ({ editor }) => {
        const ancestorNode = editor.api.block({ highest: true })
        if (!ancestorNode) return
        const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0
        void editor.getApi(AIChatPlugin).aiChat.submit({
          mode: 'insert',
          prompt: isEmpty ? t.raw('ai.continueEmptyWritingPrompt') : t.raw('ai.continueWritingPrompt'),
        })
      },
    },
    discard: {
      icon: <XIcon />,
      label: t('ai.discard'),
      shortcut: 'Escape',
      value: 'discard',
      onSelect: ({ editor }) => {
        editor.getTransforms(AIPlugin).ai.undo()
        editor.getApi(AIChatPlugin).aiChat.hide()
      },
    },
    emojify: {
      icon: <SmileIcon />,
      label: t('ai.emojify'),
      value: 'emojify',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({ prompt: t('ai.emojifyPrompt') })
      },
    },
    explain: {
      icon: <BadgeHelpIcon />,
      label: t('ai.explain'),
      value: 'explain',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: {
            default: `${t('ai.explain')} {editor}`,
            selecting: t('ai.explain'),
          },
        })
      },
    },
    fixSpelling: {
      icon: <CheckIcon />,
      label: t('ai.fixGrammar'),
      value: 'fixSpelling',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t('ai.fixGrammarPrompt'),
        })
      },
    },
    improveWriting: {
      icon: <WandIcon />,
      label: t('ai.improveWriting'),
      value: 'improveWriting',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t('ai.improveWritingPrompt'),
        })
      },
    },
    insertBelow: {
      icon: <ListEndIcon />,
      label: t('ai.insertBelow'),
      value: 'insertBelow',
      onSelect: ({ aiEditor, editor }) => {
        void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor)
      },
    },
    makeLonger: {
      icon: <ListPlusIcon />,
      label: t('ai.makeLonger'),
      value: 'makeLonger',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t('ai.makeLongerPrompt'),
        })
      },
    },
    makeShorter: {
      icon: <ListMinusIcon />,
      label: t('ai.makeShorter'),
      value: 'makeShorter',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t('ai.makeShorterPrompt'),
        })
      },
    },
    replace: {
      icon: <CheckIcon />,
      label: t('ai.replace'),
      value: 'replace',
      onSelect: ({ aiEditor, editor }) => {
        void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor)
      },
    },
    simplifyLanguage: {
      icon: <FeatherIcon />,
      label: t('ai.simplifyLanguage'),
      value: 'simplifyLanguage',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: t('ai.simplifyLanguagePrompt'),
        })
      },
    },
    summarize: {
      icon: <AlbumIcon />,
      label: t('ai.summarize'),
      value: 'summarize',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          mode: 'insert',
          prompt: {
            default: `${t('ai.summarizePrompt')} {editor}`,
            selecting: t('ai.summarizePrompt'),
          },
        })
      },
    },
    tryAgain: {
      icon: <CornerUpLeftIcon />,
      label: t('ai.tryAgain'),
      value: 'tryAgain',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.reload()
      },
    },
  } satisfies Record<string, AIChatItem>
}

export const AIMenu = () => {
  const { api, editor } = useEditorPlugin(AIChatPlugin)
  const open = usePluginOption(AIChatPlugin, 'open')
  const mode = usePluginOption(AIChatPlugin, 'mode')
  const streaming = usePluginOption(AIChatPlugin, 'streaming')
  const isSelecting = useIsSelecting() as boolean
  const t = useTranslations('Editor')

  const [value, setValue] = useState('')

  const chat = useChat()

  const { input, messages, setInput, status } = chat
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)

  const content = useLastAssistantMessage()?.content

  const placeholder = useMemo(
    () => (messages?.length ? t('placeholders.askAIEdit') : t('placeholders.askAI')),
    [messages, t],
  )

  // const placeholder = useMemo(() => {
  //   if (messages && messages.length > 0 && !isSelecting) return t('placeholders.askAIEdit')
  //   return t('placeholders.askAI')
  // }, [messages, isSelecting, t])

  useEffect(() => {
    if (!streaming) return
    const anchor = api.aiChat.node({ anchor: true })
    setTimeout(() => {
      const anchorDom = editor.api.toDOMNode(anchor![0])!
      setAnchorElement(anchorDom)
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming])

  const setOpen = useCallback(
    (open: boolean) => {
      if (open) return api.aiChat.show()
      api.aiChat.hide()
    },
    [api],
  )

  const show = useCallback(
    (anchorElement: HTMLElement) => {
      setAnchorElement(anchorElement)
      setOpen(true)
    },
    [setOpen],
  )

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      show(editor.api.toDOMNode(blocks.at(-1)![0])!)
    },
    onOpenChange: open => {
      if (!open) {
        setAnchorElement(null)
        setInput('')
      }
    },
    onOpenCursor: () => {
      const [ancestor] = editor.api.block({ highest: true })!

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
        editor.getApi(BlockSelectionPlugin).blockSelection.set(ancestor.id as string)
      }

      show(editor.api.toDOMNode(ancestor)!)
    },
    onOpenSelection: () => {
      show(editor.api.toDOMNode(editor.api.blocks().at(-1)![0])!)
    },
  })

  useHotkeys('esc', () => {
    api.aiChat.stop()
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  if (isLoading && mode === 'insert') return null

  return (
    <Popover modal={false} onOpenChange={setOpen} open={open}>
      <PopoverAnchor virtualRef={{ current: anchorElement! }} />

      <PopoverContent
        align="center"
        className="border-none bg-transparent p-0 shadow-none"
        onEscapeKeyDown={e => {
          e.preventDefault()
          api.aiChat.hide()
        }}
        side="bottom"
        style={{
          width: anchorElement?.offsetWidth,
        }}
      >
        <Command className="w-full rounded-lg border shadow-md" onValueChange={setValue} value={value}>
          {mode === 'chat' && isSelecting && content && <AIChatEditor content={content} />}

          {isLoading ? (
            <div className="flex grow items-center gap-2 p-2 text-sm text-muted-foreground select-none">
              <Loader2Icon className="size-4 animate-spin" />
              {messages.length > 1 ? t('ai.editing') : t('ai.thinking')}
            </div>
          ) : (
            <CommandPrimitive.Input
              autoFocus
              className={cn(
                `
                  flex h-9 w-full min-w-0 border-b border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow]
                  outline-none
                  placeholder:text-muted-foreground
                  focus-visible:ring-transparent
                  aria-invalid:border-destructive aria-invalid:ring-destructive/20
                  md:text-sm
                  dark:bg-input/30 dark:aria-invalid:ring-destructive/40
                `,
              )}
              data-plate-focus
              onKeyDown={e => {
                if (isHotkey('backspace')(e) && input.length === 0) {
                  e.preventDefault()
                  api.aiChat.hide()
                }
                if (isHotkey('enter')(e) && !e.shiftKey && !value) {
                  e.preventDefault()
                  void api.aiChat.submit()
                }
              }}
              onValueChange={setInput}
              placeholder={placeholder}
              value={input}
            />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems setValue={setValue} />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const AIMenuItems = ({ setValue }: { setValue: (value: string) => void }) => {
  const editor = useEditorRef()
  const options = usePluginOption(AIChatPlugin, 'chat')
  const aiEditor = usePluginOption(AIChatPlugin, 'aiEditor') as SlateEditor
  const isSelecting = useIsSelecting() as boolean
  const aiChatItems = useAIChatItems()

  const messages = useMemo(() => (options ? options?.messages : []), [options])

  const menuStateItems = useMemo<MenuStateItems>(
    () => ({
      cursorCommand: [
        {
          items: [aiChatItems.continueWrite, aiChatItems.summarize, aiChatItems.explain],
        },
      ],
      cursorSuggestion: [
        {
          items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
        },
      ],
      selectionCommand: [
        {
          items: [
            aiChatItems.improveWriting,
            aiChatItems.emojify,
            aiChatItems.makeLonger,
            aiChatItems.makeShorter,
            aiChatItems.fixSpelling,
            aiChatItems.simplifyLanguage,
          ],
        },
      ],
      selectionSuggestion: [
        {
          items: [aiChatItems.replace, aiChatItems.insertBelow, aiChatItems.discard, aiChatItems.tryAgain],
        },
      ],
    }),
    [aiChatItems],
  )

  const menuState = useMemo(() => {
    if (messages && messages.length > 0) {
      return isSelecting ? 'selectionSuggestion' : 'cursorSuggestion'
    }
    return isSelecting ? 'selectionCommand' : 'cursorCommand'
  }, [isSelecting, messages])

  const menuGroups = useMemo(() => menuStateItems[menuState], [menuState, menuStateItems])

  useEffect(() => {
    if (menuGroups.length > 0 && menuGroups[0].items.length > 0) {
      setValue(menuGroups[0].items[0].value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue])

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup heading={group.heading} key={index}>
          {group.items.map(menuItem => (
            <CommandItem
              className="[&_svg]:text-muted-foreground"
              key={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({ aiEditor, editor })
              }}
              value={menuItem.value}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  )
}

export const AILoadingBar = () => {
  const chat = usePluginOption(AIChatPlugin, 'chat' as Any) as ReturnType<typeof useChat>
  const mode = usePluginOption(AIChatPlugin, 'mode' as Any) as 'chat' | 'insert'
  const t = useTranslations('Editor')

  const { status } = chat

  const { api } = useEditorPlugin(AIChatPlugin)

  const isLoading = status === 'streaming' || status === 'submitted'

  const visible = isLoading && mode === 'insert'

  if (!visible) return null

  return (
    <div
      className={cn(
        `
          absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5
          text-sm text-muted-foreground shadow-md transition-all duration-300
        `,
      )}
    >
      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      <span>{status === 'submitted' ? t('ai.thinking') : t('ai.writing')}</span>
      <Button className="flex items-center gap-1 text-xs" onClick={() => api.aiChat.stop()} size="sm" variant="ghost">
        <PauseIcon className="size-4" />
        {t('ai.stop')}
        <kbd className="ml-1 rounded-sm bg-border px-1 font-mono text-[10px] text-muted-foreground shadow-sm">
          {'Esc'}
        </kbd>
      </Button>
    </div>
  )
}
