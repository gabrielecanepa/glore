'use client'

import { redirect } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import {
  AwardIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  HelpCircleIcon,
  InfoIcon,
  LogOutIcon,
  MessageCircleQuestionIcon,
  PlusIcon,
  SettingsIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { titleize } from '@repo/utils'

import { type User, type UserOrg } from '@/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DashboardIcon } from '@/components/ui/icons/dashboard-icon'
import { Image } from '@/components/ui/image'
import { LanguageSelect } from '@/components/ui/language-select'
import { Link } from '@/components/ui/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/ui/theme-switch'
import { useDashboard } from '@/hooks/use-dashboard'
import { useDB } from '@/hooks/use-db'
import { usePathname } from '@/hooks/use-pathname'
import { Route, type Pathname } from '@/lib/navigation'
import { Cookie, setCookie } from '@/lib/storage'
import { cn } from '@/lib/utils'

export const SidebarOrgs = ({ items }: { items: User['orgs'] }) => {
  const { isMobile, open } = useSidebar()
  const t = useTranslations('Navigation')

  const [activeOrg, setActiveOrg] = useState(items.find(org => org.isActive) || items[0])

  const getOrgInitials = useCallback((org: UserOrg) => org.name.charAt(0).toUpperCase(), [])

  const onOrgSelect = useCallback((org: User['orgs'][number]) => {
    setActiveOrg(org)
    setCookie(Cookie.CurrentOrg, org.id)
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="justify-center py-7 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar
                className={cn(
                  'aspect-square size-10 overflow-hidden rounded-lg border transition-all duration-150',
                  !open && 'ml-8',
                )}
              >
                {activeOrg.avatar_url && <AvatarImage alt={activeOrg.avatar_url} src={activeOrg.avatar_url} />}
                <AvatarFallback className="text-muted-foreground">{getOrgInitials(activeOrg)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{activeOrg.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{titleize(activeOrg.role)}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 stroke-foreground/64" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t('organizations')}</DropdownMenuLabel>
            {items.map(org => (
              <DropdownMenuItem
                className={cn('gap-2 p-2', org.isActive && 'bg-accent/50')}
                key={org.id}
                onClick={onOrgSelect.bind(null, org)}
              >
                <Avatar className="aspect-square size-10 rounded-lg border">
                  {org.avatar_url && <AvatarImage alt={org.avatar_url} src={org.avatar_url} />}
                  <AvatarFallback className="text-muted-foreground">{getOrgInitials(org)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{org.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{titleize(org.role)}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-normal text-muted-foreground">{t('addOrganization')}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const SidebarNavigation = () => {
  const pathname = usePathname()
  const t = useTranslations('Navigation')

  const [currentPath, setCurrentPath] = useState<Pathname>(pathname)
  const [docsCollapsibleOpen, setDocsCollapsibleOpen] = useState(currentPath.startsWith(Route.Docs))

  const onButtonClick = useCallback(
    (path: Pathname) => () => {
      setCurrentPath(path)
    },
    [],
  )

  const isActivePath = useCallback(
    (path: Pathname) => {
      if (path === currentPath) return true
      if (path === Route.Home) return pathname === Route.Home
      return currentPath.startsWith(path)
    },
    [currentPath, pathname],
  )

  const toggleDocsCollapsible = useCallback(() => setDocsCollapsibleOpen(open => !open), [])

  const onDocsClick = useCallback(
    (e: React.MouseEvent) => {
      setCurrentPath(Route.Docs)
      if (!isActivePath(Route.Docs) && docsCollapsibleOpen) {
        e.stopPropagation()
        e.preventDefault()
        return
      }
      toggleDocsCollapsible()
    },
    [docsCollapsibleOpen, isActivePath, toggleDocsCollapsible],
  )

  const getSubItemClass = useCallback(
    (path: Pathname) => {
      const isActive = isActivePath(path)
      return cn(
        'border-l-2 border-transparent py-1.5 text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground',
        isActive &&
          'rounded-tl-none border-muted-foreground data-[active=true]:rounded-bl-none data-[active=true]:border-sidebar-border',
      )
    },
    [isActivePath],
  )

  return (
    <SidebarGroup>
      <SidebarMenu className="mt-4">
        <SidebarMenuItem>
          <SidebarMenuButton
            active={isActivePath(Route.Home)}
            asChild
            onClick={onButtonClick(Route.Home)}
            title={t('dashboard')}
            tooltip={t('dashboard')}
          >
            <Link href={Route.Home}>
              <DashboardIcon className="size-4" />
              <span>{t('dashboard')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            active={isActivePath(Route.Modules)}
            asChild
            onClick={onButtonClick(Route.Modules)}
            title={t('modules')}
            tooltip={t('modules')}
          >
            <Link href={Route.Modules}>
              <BookOpenIcon className="size-4" />
              <span>{t('modules')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            active={isActivePath(Route.Certificates)}
            asChild
            onClick={onButtonClick(Route.Certificates)}
            title={t('certificates')}
            tooltip={t('certificates')}
          >
            <Link href={Route.Certificates}>
              <AwardIcon className="size-4" />
              <span>{t('certificates')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible asChild className="group/collapsible" open={docsCollapsibleOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                active={isActivePath(Route.Docs)}
                asChild
                onClick={onDocsClick}
                title={t('docs')}
                tooltip={t('docs')}
              >
                <Link href={Route.Docs}>
                  <MessageCircleQuestionIcon className="size-4" />
                  <span>{t('docs')}</span>
                </Link>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction
                className={cn('cursor-pointer data-[state=open]:rotate-90', isActivePath(Route.Docs) && 'hover:border')}
                onClick={toggleDocsCollapsible}
              >
                <ChevronRightIcon className="stroke-foreground/64" />
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuButton
                    active={isActivePath(Route.DocsIntro)}
                    asChild
                    className={getSubItemClass(Route.DocsIntro)}
                    onClick={onButtonClick(Route.DocsIntro)}
                    title={t('docsIntro')}
                    tooltip={t('docsIntro')}
                  >
                    <Link href={Route.DocsIntro}>{t('docsIntro')}</Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuButton
                    active={isActivePath(Route.DocsTutorials)}
                    asChild
                    className={getSubItemClass(Route.DocsTutorials)}
                    onClick={onButtonClick(Route.DocsTutorials)}
                    title={t('docsTutorials')}
                    tooltip={t('docsTutorials')}
                  >
                    <Link href={Route.DocsTutorials}>{t('docsTutorials')}</Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuButton
                    active={isActivePath(Route.DocsFaq)}
                    asChild
                    className={getSubItemClass(Route.DocsFaq)}
                    onClick={onButtonClick(Route.DocsFaq)}
                    title={t('docsFaq')}
                    tooltip={t('docsFaq')}
                  >
                    <Link href={Route.DocsFaq}>{t('docsFaq')}</Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}

const SidebarUser = ({ user }: { user: User }) => {
  const { auth } = useDB()
  const { open, openMobile, setOpenMobile } = useSidebar()
  const t = useTranslations()

  const currentOrg = useMemo(() => user.orgs.find(org => org.isActive), [user])
  const initials = useMemo(
    () =>
      user.name
        .split(' ')
        .map(name => name[0])
        .join('') || '',
    [user],
  )

  const onLinkClick = useCallback(() => {
    if (openMobile) {
      setOpenMobile(false)
    }
  }, [openMobile, setOpenMobile])

  const logOutUser = useCallback(async () => {
    onLinkClick()
    await auth.signOut()
    redirect(Route.Login)
  }, [auth, onLinkClick])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={cn(
                'py-7 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                open ? 'overflow-hidden' : 'overflow-visible',
              )}
              size="lg"
            >
              <div className={cn('relative overflow-visible transition-all duration-150', open ? 'ml-0' : 'ml-8')}>
                <Avatar className="aspect-square size-8 rounded-lg border">
                  <AvatarImage alt={user.name} src={user.avatar_url} />
                  <AvatarFallback className="text-muted-foreground">{initials}</AvatarFallback>
                </Avatar>
                {currentOrg?.avatar_url && (
                  <Image
                    alt={currentOrg.name}
                    className="absolute -right-1 -bottom-1 rounded-full object-cover"
                    height={14}
                    src={currentOrg.avatar_url}
                    width={14}
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{user.username}</span>
              </div>
              <ChevronsUpDownIcon className={cn('ml-auto size-4 stroke-foreground/64 leading-tight', !open && 'invisible')} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-68 rounded-lg pt-2"
            side="top"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <Link href={Route.Settings} onClick={onLinkClick}>
                <DropdownMenuItem>
                  <SettingsIcon />
                  {t('Navigation.settings')}
                </DropdownMenuItem>
              </Link>
              <Link href={Route.Help} onClick={onLinkClick}>
                <DropdownMenuItem>
                  <HelpCircleIcon />
                  {t('Navigation.help')}
                </DropdownMenuItem>
              </Link>
              <Link href={Route.About} onClick={onLinkClick}>
                <DropdownMenuItem>
                  <InfoIcon />
                  {t('Navigation.about')}
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={logOutUser}>
                <LogOutIcon />
                {t('Navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="p-1">
              <div className="flex items-center px-1.5 py-1">
                <span className="text-[13px] leading-[16px] font-medium text-muted-foreground">{t('Common.preferences')}</span>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuGroup className="p-1 pt-0">
              <div className="flex h-10 w-full items-center justify-between gap-4 px-1.5">
                <span className="text-sm font-normal text-foreground">{t('Common.theme')}</span>
                <div data-orientation="horizontal" dir="ltr">
                  <ThemeSwitch />
                </div>
              </div>
              <div className="flex h-10 w-full items-center justify-between gap-4 px-1.5">
                <span className="text-sm font-normal text-foreground">{t('Common.language')}</span>
                <div data-orientation="horizontal" dir="ltr">
                  <LanguageSelect className="h-8 px-2" />
                </div>
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export const AppSidebar = ({
  defaultOpen,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  defaultOpen?: boolean
}) => {
  const { user } = useDashboard()

  return (
    <Sidebar className="overflow-hidden" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarOrgs items={user.orgs} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
