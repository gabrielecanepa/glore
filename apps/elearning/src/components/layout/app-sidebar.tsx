'use client'

import { redirect, useRouter } from 'next/navigation'
import { Fragment, useCallback, useMemo, useState } from 'react'

import {
  AwardIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CogIcon,
  HelpCircleIcon,
  InfoIcon,
  LogOutIcon,
  MessageCircleQuestionIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  ShieldUserIcon,
} from 'lucide-react'

import { titleize } from '@repo/utils/titleize'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { DashboardIcon } from '@/components/ui/icons/dashboard'
import { type Icon } from '@/components/ui/icons/types'
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
  type SidebarMenuButtonProps,
} from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/ui/theme-switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useDatabase } from '@/hooks/use-database'
import { usePathname } from '@/hooks/use-pathname'
import { useSession } from '@/hooks/use-session'
import { useTranslations } from '@/hooks/use-translations'
import { type User, type UserOrganization } from '@/lib/api/users/types'
import { Route } from '@/lib/navigation'
import { cookies } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface SidebarItemProps<I extends Icon = Icon>
  extends Omit<SidebarMenuButtonProps, 'icon'>,
    React.PropsWithChildren<{
      className?: string
      icon?: I
      iconProps?: React.ComponentProps<I>
      label: string
      route: Route
      subItem?: boolean
    }> {}

const SidebarOrgs = ({
  currentOrg,
  orgs,
  setOrg,
}: {
  currentOrg: UserOrganization
  orgs: UserOrganization[]
  setOrg: (org: UserOrganization) => void
}) => {
  const { setPathname } = usePathname()
  const router = useRouter()
  const { isMobile, open } = useSidebar()
  const t = useTranslations('Navigation')

  const getOrgInitials = useCallback((org: UserOrganization) => org.name.slice(0, 2).toUpperCase(), [])

  const onOrgSelect = useCallback(
    (org: UserOrganization) => {
      cookies.set('org', org.id)
      router.push(Route.Home)
      setPathname(Route.Home)
      setTimeout(() => {
        setOrg(org)
      }, 200)
    },
    [router, setOrg, setPathname],
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              asChild
              className={`
                justify-center overflow-visible rounded-lg py-7
                peer-data-[state=collapsed]:border
                data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
              `}
              size="lg"
            >
              <>
                <Avatar
                  className={cn(
                    'flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg bg-muted transition-all duration-150',
                    !open && 'ml-8 size-8 text-xs',
                    !currentOrg.avatarUrl && 'border',
                  )}
                >
                  {currentOrg.avatarUrl ? (
                    <AvatarImage alt={currentOrg.name} src={currentOrg.avatarUrl} />
                  ) : (
                    <span className="text-muted-foreground">{getOrgInitials(currentOrg)}</span>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{currentOrg.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {titleize(currentOrg.role)}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4 stroke-foreground/64" />
              </>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t('organizations')}</DropdownMenuLabel>
            {orgs.map(org => (
              <DropdownMenuItem className="gap-2 p-2" key={org.id} onClick={onOrgSelect.bind(null, org)}>
                <Avatar className="aspect-square size-10 rounded-lg border">
                  {org.avatarUrl && <AvatarImage alt={org.avatarUrl} src={org.avatarUrl} />}
                  <AvatarFallback className="text-muted-foreground">{getOrgInitials(org)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="flex items-center truncate font-semibold">
                    {org.name}
                    {org.id === currentOrg.id && (
                      <span className="mt-[1.5px] ml-1.5 inline-block size-[7px] rounded-full bg-green-500"></span>
                    )}
                  </span>
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

const SidebarNavItem = <I extends Icon = Icon>({
  asChild = false,
  className,
  icon,
  iconProps,
  label,
  onClick,
  route,
  subItem,
}: SidebarItemProps<I>) => {
  const { pathname, setPathname } = usePathname()

  const Wrapper = useMemo(() => {
    if (asChild) return Fragment
    return subItem ? SidebarMenuSubItem : SidebarMenuItem
  }, [asChild, subItem])

  const isActivePath = useMemo(() => route === pathname, [pathname, route])

  const isActiveRoute = useMemo(
    () => isActivePath || (route === Route.Home ? pathname === Route.Home : pathname.startsWith(route)),
    [pathname, route, isActivePath],
  )

  const active = useMemo(() => (subItem ? isActivePath : isActiveRoute), [isActivePath, isActiveRoute, subItem])

  const buttonClassName = useMemo(() => {
    if (!subItem) return className
    return cn(
      `
        border-l-2 border-transparent py-1.5 text-[13px] text-sidebar-foreground/70
        hover:text-sidebar-foreground
        data-[active=true]:rounded-l-none data-[active=true]:border-sidebar-border
      `,
      className,
    )
  }, [className, subItem])

  const content = useMemo(() => {
    const Icon = icon as Icon
    const { className: iconClassName, ...iconRest } = iconProps || {}
    const inner = (
      <>
        {Icon && <Icon className={cn('size-4 text-muted-foreground', iconClassName)} {...iconRest} />}
        <span>{label}</span>
      </>
    )
    return isActivePath ? <span>{inner}</span> : <Link href={route}>{inner}</Link>
  }, [iconProps, icon, isActivePath, label, route])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (isActivePath) return
      setPathname(route)
    },
    [isActivePath, onClick, route, setPathname],
  )

  return (
    <Wrapper>
      <SidebarMenuButton
        active={active}
        asChild
        className={cn(buttonClassName, isActivePath && 'cursor-default')}
        onClick={handleClick}
        tooltip={label}
      >
        {content}
      </SidebarMenuButton>
    </Wrapper>
  )
}

const SidebarNavCollapsible = ({ children, icon, label, route }: SidebarItemProps) => {
  const { pathname } = usePathname()
  const [open, setOpen] = useState(pathname.startsWith(route))

  const toggleCollapsible = useCallback(() => setOpen(open => !open), [])

  const handleClick = useCallback(() => {
    if (!open) setOpen(true)
  }, [open])

  return (
    <Collapsible asChild open={open}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarNavItem asChild icon={icon} label={label} onClick={handleClick} route={route} />
        </CollapsibleTrigger>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className={cn('cursor-pointer data-[state=open]:rotate-90')} onClick={toggleCollapsible}>
            <ChevronRightIcon className="stroke-foreground/64" />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarNav = () => {
  const { user } = useSession()
  const t = useTranslations('Navigation')

  const showCertificates = useMemo(() => !user.canEdit, [user.canEdit])

  return (
    <SidebarGroup>
      <SidebarMenu className="mt-4">
        <SidebarNavItem icon={DashboardIcon} iconProps={{ colored: true }} label={t('dashboard')} route={Route.Home} />
        <SidebarNavItem icon={BookOpenIcon} label={t('courses')} route={Route.Courses} />
        {showCertificates && <SidebarNavItem icon={AwardIcon} label={t('certificates')} route={Route.Certificates} />}
        <SidebarNavCollapsible icon={MessageCircleQuestionIcon} label={t('docs')} route={Route.Docs}>
          <SidebarNavItem label={t('docsIntro')} route={Route.DocsIntro} subItem />
          <SidebarNavItem label={t('docsTutorials')} route={Route.DocsTutorials} subItem />
          <SidebarNavItem label={t('docsFaq')} route={Route.DocsFaq} subItem />
        </SidebarNavCollapsible>
        {user.isAdmin && <SidebarNavItem icon={CogIcon} label={t('admin')} route={Route.Admin} />}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const SidebarUser = ({ organization, user }: { organization?: UserOrganization; user: User }) => {
  const db = useDatabase()
  const { open, openMobile, setOpenMobile } = useSidebar()
  const t = useTranslations()

  const onLinkClick = useCallback(() => {
    if (openMobile) {
      setOpenMobile(false)
    }
  }, [openMobile, setOpenMobile])

  const logOutUser = useCallback(async () => {
    onLinkClick()
    await db.auth.signOut()
    redirect(Route.Login)
  }, [db.auth, onLinkClick])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={cn(
                `
                  group/sidebar-user rounded-lg border bg-popover py-7 shadow-sm transition-all duration-150
                  hover:bg-popover
                  aria-expanded:border-transparent
                `,
                open ? 'overflow-hidden shadow-inner' : 'overflow-visible',
              )}
              size="lg"
            >
              <>
                <div className={cn('relative overflow-visible transition-all duration-150', open ? 'ml-0' : 'ml-8')}>
                  <Avatar
                    className={cn(
                      'aspect-square size-8 rounded-lg border',
                      !open && 'text-xs',
                      !user.avatarUrl && 'border',
                    )}
                  >
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                    <AvatarFallback className="text-muted-foreground">{user.initials}</AvatarFallback>
                  </Avatar>
                  {organization?.avatarUrl && (
                    <Image
                      className="absolute -right-1 -bottom-1 rounded-full object-cover"
                      height={14}
                      src={organization.avatarUrl}
                      width={14}
                    />
                  )}
                </div>
                <div className={cn('grid flex-1 text-left text-sm leading-tight', !open && 'hidden')}>
                  <span className="flex items-center gap-1 font-semibold">
                    {user.firstName}
                    {user.isAdmin && (
                      <Tooltip disableHoverableContent>
                        <TooltipTrigger
                          asChild
                          className="group-aria-[expanded=true]/sidebar-user:pointer-events-none!"
                          pointerEvents="auto"
                        >
                          <ShieldUserIcon className="size-3" />
                        </TooltipTrigger>
                        <TooltipContent sideOffset={3}>
                          <span className="text-xs">{t('Navigation.adminUser')}</span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {user.isEditor && (
                      <Tooltip disableHoverableContent>
                        <TooltipTrigger
                          asChild
                          className="group-aria-[expanded=true]/sidebar-user:pointer-events-none!"
                          pointerEvents="auto"
                        >
                          <PencilIcon className="size-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">{t('Navigation.editorUser')}</span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{user.username}</span>
                </div>
                <Button
                  asChild
                  className={cn(
                    'ml-auto flex size-6 items-center justify-center border border-transparent hover:border-border',
                    !open && 'invisible',
                  )}
                  variant="ghost"
                >
                  <span>
                    <ChevronsUpDownIcon className="size-4 stroke-foreground/64" />
                  </span>
                </Button>
              </>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-68 rounded-lg pt-2"
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
                <span className="text-[13px] leading-[16px] font-medium text-muted-foreground">
                  {t('Common.preferences')}
                </span>
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
                  <LanguageSelect className="h-9 px-2 text-[13.8px]" />
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
  const { organization, setUser, user } = useSession()

  const setCurrentOrg = useCallback(
    (org: UserOrganization) => {
      setUser(prev => ({ ...prev, current_org: org }))
    },
    [setUser],
  )

  return (
    <Sidebar className="overflow-hidden" collapsible="icon" {...props}>
      {organization && (
        <SidebarHeader>
          <SidebarOrgs currentOrg={organization} orgs={user.organizations} setOrg={setCurrentOrg} />
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser organization={organization} user={user} />
      </SidebarFooter>
      <SidebarRail tabIndex={-1} />
    </Sidebar>
  )
}
