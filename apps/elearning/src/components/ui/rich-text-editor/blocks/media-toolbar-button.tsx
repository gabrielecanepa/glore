'use client'

import { useCallback, useState } from 'react'

import { PlaceholderPlugin } from '@platejs/media/react'
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu'
import { AudioLinesIcon, FileUpIcon, FilmIcon, ImageIcon, LinkIcon } from 'lucide-react'
import { isUrl, KEYS } from 'platejs'
import { useEditorRef } from 'platejs/react'
import { toast } from 'sonner'
import { useFilePicker } from 'use-file-picker'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useTranslations } from '@/hooks/use-translations'
import { ToolbarSplitButton, ToolbarSplitButtonPrimary, ToolbarSplitButtonSecondary } from '@rte/blocks/toolbar'

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[]
    icon: React.ReactNode
    title: string
    tooltip: string
  }
> = {
  [KEYS.audio]: {
    accept: ['audio/*'],
    icon: <AudioLinesIcon className="size-4" />,
    title: 'Insert Audio',
    tooltip: 'Audio',
  },
  [KEYS.file]: {
    accept: ['*'],
    icon: <FileUpIcon className="size-4" />,
    title: 'Insert File',
    tooltip: 'File',
  },
  [KEYS.img]: {
    accept: ['image/*'],
    icon: <ImageIcon className="size-4" />,
    title: 'Insert Image',
    tooltip: 'Image',
  },
  [KEYS.video]: {
    accept: ['video/*'],
    icon: <FilmIcon className="size-4" />,
    title: 'Insert Video',
    tooltip: 'Video',
  },
}

export const MediaToolbarButton = ({
  nodeType,
  tooltip,
  ...props
}: DropdownMenuProps & {
  nodeType: string
  tooltip?: string
}) => {
  const currentConfig = MEDIA_CONFIG[nodeType]

  const editor = useEditorRef()
  const t = useTranslations('Editor.blocks')

  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { openFilePicker } = useFilePicker({
    accept: currentConfig.accept,
    multiple: true,
    onFilesSelected: ({ plainFiles }) => {
      const files = plainFiles as FileList
      editor.getTransforms(PlaceholderPlugin).insert.media(files)
    },
  })

  return (
    <>
      <ToolbarSplitButton
        onClick={() => {
          openFilePicker()
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        pressed={open}
      >
        <ToolbarSplitButtonPrimary tooltip={tooltip}>{currentConfig.icon}</ToolbarSplitButtonPrimary>

        <DropdownMenu modal={false} onOpenChange={setOpen} open={open} {...props}>
          <DropdownMenuTrigger asChild>
            <ToolbarSplitButtonSecondary />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" alignOffset={-32} onClick={e => e.stopPropagation()}>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => openFilePicker()}>
                {currentConfig.icon}
                {t('imageUpload')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                <LinkIcon />
                {t('imageInsertUrl')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarSplitButton>

      <AlertDialog
        onOpenChange={value => {
          setDialogOpen(value)
        }}
        open={dialogOpen}
      >
        <AlertDialogContent className="gap-6">
          <MediaUrlDialogContent currentConfig={currentConfig} nodeType={nodeType} setOpen={setDialogOpen} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const MediaUrlDialogContent = ({
  currentConfig,
  nodeType,
  setOpen,
}: {
  currentConfig: (typeof MEDIA_CONFIG)[string]
  nodeType: string
  setOpen: (value: boolean) => void
}) => {
  const editor = useEditorRef()
  const t = useTranslations('Common')

  const [url, setUrl] = useState('')

  const embedMedia = useCallback(() => {
    if (!isUrl(url)) return toast.error(t('invalidUrl'))

    setOpen(false)
    editor.tf.insertNodes({
      children: [{ text: '' }],
      name: nodeType === KEYS.file ? url.split('/').pop() : undefined,
      type: nodeType,
      url,
    })
  }, [url, editor, nodeType, setOpen, t])

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{currentConfig.title}</AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="group relative w-full">
        <label
          className={`
            absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all
            group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs
            group-focus-within:font-medium group-focus-within:text-foreground
            has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0
            has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs
            has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground
          `}
          htmlFor="url"
        >
          <span className="inline-flex bg-background px-2">{t('url')}</span>
        </label>
        <Input
          autoFocus
          className="w-full"
          id="url"
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') embedMedia()
          }}
          placeholder=""
          type="url"
          value={url}
        />
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
        <AlertDialogAction
          onClick={e => {
            e.preventDefault()
            embedMedia()
          }}
        >
          {t('insert')}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
