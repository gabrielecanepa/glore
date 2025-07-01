import { useCallback, useRef, useState } from 'react'

import type { Editor } from '@tiptap/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImageEditBlockProps {
  editor: Editor
  close: () => void
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({ close, editor }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [link, setLink] = useState('')

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) return

      const contentBucket = []
      const filesArray = Array.from(files)

      for (const file of filesArray) {
        contentBucket.push({ src: file })
      }

      editor.commands.setImages(contentBucket)
      close()
    },
    [editor, close],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (link) {
        editor.commands.setImages([{ src: link }])
        close()
      }
    },
    [editor, link, close],
  )

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <Label htmlFor="image-link">{'Attach an image link'}</Label>
        <div className="flex">
          <Input
            className="grow"
            id="image-link"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
            placeholder="https://example.com"
            required
            type="url"
            value={link}
          />
          <Button className="ml-2" type="submit">
            {'Submit'}
          </Button>
        </div>
      </div>
      <Button className="w-full" onClick={handleClick} type="button">
        {'Upload from your computer'}
      </Button>
      <input accept="image/*" className="hidden" multiple onChange={handleFile} ref={fileInputRef} type="file" />
    </form>
  )
}
