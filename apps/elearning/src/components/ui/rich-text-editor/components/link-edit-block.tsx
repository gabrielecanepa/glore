import { useCallback, useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface LinkEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultUrl?: string
  defaultText?: string
  defaultIsNewTab?: boolean
  onSave: (url: string, text?: string, isNewTab?: boolean) => void
  ref?: React.Ref<HTMLDivElement>
}

export const LinkEditBlock = ({
  className,
  defaultIsNewTab,
  defaultText,
  defaultUrl,
  onSave,
}: Omit<LinkEditorProps, 'ref'>) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [url, setUrl] = useState(defaultUrl || '')
  const [text, setText] = useState(defaultText || '')
  const [isNewTab, setIsNewTab] = useState(defaultIsNewTab || false)

  const handleSave = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (formRef.current && formRef.current.checkValidity()) {
        onSave(url, text, isNewTab)
      }
    },
    [onSave, url, text, isNewTab],
  )

  return (
    <form onSubmit={handleSave} ref={formRef}>
      <div className={cn('space-y-4', className)}>
        <div className="space-y-1">
          <Label>{'URL'}</Label>
          <Input onChange={e => setUrl(e.target.value)} placeholder="Enter URL" required type="url" value={url} />
        </div>

        <div className="space-y-1">
          <Label>{'Display Text (optional)'}</Label>
          <Input onChange={e => setText(e.target.value)} placeholder="Enter display text" type="text" value={text} />
        </div>

        <div className="flex items-center space-x-2">
          <Label>{'Open in New Tab'}</Label>
          <Switch checked={isNewTab} onCheckedChange={setIsNewTab} />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit">{'Save'}</Button>
        </div>
      </div>
    </form>
  )
}
