'use client'

import { useMemo } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Logo } from '@/components/ui/icons/logo'
import { Link } from '@/components/ui/link'
import { SIDEBAR_KEYBOARD_SHORTCUT, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useHeader } from '@/hooks/use-header'
import { usePathname } from '@/hooks/use-pathname'
import { useScroll } from '@/hooks/use-scroll'
import { useTranslations } from '@/hooks/use-translations'
import { Route } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export const AppHeader = ({ className, ...props }: React.ComponentPropsWithRef<'header'>) => {
  const { header, shadow } = useHeader()
  const { pathname } = usePathname()
  const { scrolled } = useScroll()
  const { open } = useSidebar()
  // const { syncState } = useSyncState()
  const t = useTranslations()

  const sidebarAction = useMemo(() => (open ? t('Common.sidebarClose') : t('Common.sidebarOpen')), [open, t])

  // const onRefreshClick = useCallback(() => {
  //   window.location.reload()
  // }, [])

  return (
    <>
      <header
        className={cn(
          'ml-[1px] min-h-12 shrink-0 gap-2 bg-background transition-[width,height] ease-linear',
          scrolled && shadow && 'border-b',
          className,
        )}
        {...props}
      >
        <div className="flex w-full items-center justify-between gap-2 px-4 py-4">
          <div className="flex h-10 grow items-center gap-1">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <SidebarTrigger
                  className={cn(
                    '-ml-1 [&_svg]:size-[18px] [&_svg]:stroke-foreground/64 [&_svg]:text-foreground/64',
                    open && '[&_svg]:size-5',
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-medium">{sidebarAction}</p>
                <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500">{`Ctrl + ${SIDEBAR_KEYBOARD_SHORTCUT.toUpperCase()}`}</p>
              </TooltipContent>
            </Tooltip>
            {header && <Breadcrumb className="flex h-full items-center">{header}</Breadcrumb>}
          </div>
          {/* {syncState === 'syncing' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="mr-3 cursor-default">
                  <RefreshCwIcon className="size-4 animate-spin text-muted-foreground duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent arrow={false} side="bottom">
                <p>{t('Common.syncChanges')}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {syncState === 'error' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="mr-3" onClick={onRefreshClick}>
                  <RefreshCwOffIcon className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent arrow={false} className="text-center" side="bottom">
                <p>
                  {t('Common.syncError')}
                  {' ⚠️'}
                </p>
                <p className="text-[10px] text-gray-400">{t('Common.syncErrorSubtitle')}</p>
              </TooltipContent>
            </Tooltip>
          )} */}
          <Link
            className={cn(pathname === Route.Home && 'pointer-events-none')}
            href={Route.Home}
            title={t('Navigation.goToDashboard')}
          >
            <Logo className="mr-2 transition-[width,height]" height={24} />
          </Link>
        </div>
      </header>
    </>
  )
}
