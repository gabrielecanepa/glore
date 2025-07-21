import { useState } from 'react'

import { generateReactHelpers } from '@uploadthing/react'
import { toast } from 'sonner'
import type { ClientUploadedFileData, UploadFilesOptions } from 'uploadthing/types'
import { z } from 'zod'

import type { OurFileRouter } from '@/lib/uploadthing'

export type UploadedFile<T = unknown> = ClientUploadedFileData<T>

interface UseUploadFileProps
  extends Pick<
    UploadFilesOptions<OurFileRouter['editorUploader']>,
    'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'
  > {
  onUploadComplete?: (file: UploadedFile) => void
  onUploadError?: (error: unknown) => void
}

export const useUploadFile = ({ onUploadComplete, onUploadError, ...props }: UseUploadFileProps = {}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>()
  const [uploadingFile, setUploadingFile] = useState<File>()
  const [progress, setProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const uploadThing = async (file: File) => {
    setIsUploading(true)
    setUploadingFile(file)

    try {
      const res = await uploadFiles('editorUploader', {
        ...props,
        files: [file],
        onUploadProgress: ({ progress }) => {
          setProgress(Math.min(progress, 100))
        },
      })

      setUploadedFile(res[0])

      onUploadComplete?.(res[0])

      return uploadedFile
    } catch (error) {
      const errorMessage = getErrorMessage(error)

      const message = errorMessage.length > 0 ? errorMessage : 'Something went wrong, please try again later.'

      toast.error(message)

      onUploadError?.(error)

      // Mock upload for unauthenticated users
      // toast.info('User not logged in. Mocking upload process.');
      const mockUploadedFile = {
        key: 'mock-key-0',
        appUrl: `https://mock-app-url.com/${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      } as UploadedFile

      // Simulate upload progress
      let progress = 0

      const simulateProgress = async () => {
        while (progress < 100) {
          await new Promise(resolve => setTimeout(resolve, 50))
          progress += 2
          setProgress(Math.min(progress, 100))
        }
      }

      await simulateProgress()

      setUploadedFile(mockUploadedFile)

      return mockUploadedFile
    } finally {
      setProgress(0)
      setIsUploading(false)
      setUploadingFile(undefined)
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile: uploadThing,
    uploadingFile,
  }
}

export const { uploadFiles, useUploadThing } = generateReactHelpers<OurFileRouter>()

export const getErrorMessage = (err: unknown) => {
  const unknownError = 'Something went wrong, please try again later.'

  if (err instanceof z.ZodError) {
    const errors = err.issues.map(issue => issue.message)

    return errors.join('\n')
  } else if (err instanceof Error) {
    return err.message
  } else {
    return unknownError
  }
}

export const showErrorToast = (err: unknown) => {
  const errorMessage = getErrorMessage(err)

  return toast.error(errorMessage)
}
