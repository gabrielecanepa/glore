'use client'

import {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

import confetti, { type CreateTypes, type GlobalOptions, type Options } from 'canvas-confetti'

import { Button, type ButtonProps } from '@/components/ui/button'

interface ConfettiContext {
  fire: (options?: Options) => void
}

const ConfettiContext = createContext<ConfettiContext>({} as ConfettiContext)

export interface ConfettiProps extends React.ComponentPropsWithRef<'canvas'> {
  children?: ReactNode
  globalOptions?: GlobalOptions
  manualstart?: boolean
  options?: Options
}

export const Confetti = forwardRef<ConfettiContext | null, ConfettiProps>((props, ref) => {
  const { children, globalOptions = { resize: true, useWorker: true }, manualstart = false, options, ...rest } = props
  const instanceRef = useRef<CreateTypes | null>(null)

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (!instanceRef.current) {
          instanceRef.current = confetti.create(node, {
            ...globalOptions,
            resize: true,
          })
        }
        return
      }

      if (instanceRef.current) {
        instanceRef.current.reset()
        instanceRef.current = null
      }
    },
    [globalOptions],
  )

  const fire = useCallback(
    async (opts = {}) => {
      await instanceRef.current?.({ ...options, ...opts })
    },
    [options],
  )

  const contextValue = useMemo(
    () => ({
      fire,
    }),
    [fire],
  )

  useImperativeHandle(ref, () => contextValue, [contextValue])

  useEffect(() => {
    if (!manualstart) {
      void (async () => await fire())()
    }
  }, [manualstart, fire])

  return (
    <ConfettiContext.Provider value={contextValue}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  )
})

export interface ConfettiButtonProps extends Omit<ButtonProps, 'effect'> {
  children?: React.ReactNode
  effect?: 'confetti' | 'fireworks'
  options?: Options &
    GlobalOptions & {
      canvas?: HTMLCanvasElement
    }
}

export const ConfettiButton = ({ effect = 'confetti', onClick, options, ...props }: ConfettiButtonProps) => {
  const triggerFireworks = useCallback(() => {
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 1,
    }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 50 * (timeLeft / duration)

      /* eslint-disable @typescript-eslint/no-floating-promises */
      confetti({
        ...defaults,
        ...options,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        ...options,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
      /* eslint-enable @typescript-eslint/no-floating-promises */
    }, 250)
  }, [options])

  const triggerConfetti = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      await confetti({
        ...options,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      })
    },
    [options],
  )

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      switch (effect) {
        case 'fireworks':
          triggerFireworks()
          break
        case 'confetti':
          await triggerConfetti(event)
          break
      }

      if (onClick) onClick(event)
    },
    [effect, onClick, triggerConfetti, triggerFireworks],
  )

  return <Button onClick={handleClick} {...props} />
}
