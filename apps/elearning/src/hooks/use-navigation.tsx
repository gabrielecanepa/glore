import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import {
  AwardIcon,
  BookOpenIcon,
  CogIcon,
  HelpCircleIcon,
  MessageCircleQuestionIcon,
  SettingsIcon,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DashboardIcon, type CustomIcon } from '@/components/ui/icon'
import { Route } from '@/lib/navigation'
import { SemanticColor } from '@/lib/theme'

export interface Section {
  name?: string
  pages: Page[]
}

export interface Page {
  color?: SemanticColor
  Icon?: LucideIcon | CustomIcon
  isActive?: boolean
  isActivePage?: boolean
  path: Route
  subPages?: {
    title: string
    path: Route
    isActive?: boolean
    type?: 'button'
  }[]
  title: string
}

const setActivePages = (pages: Page[], pathname: Route): Page[] =>
  pages.flatMap(page => ({
    ...page,
    isActive: pathname === page.path || pathname.split('/').at(1) === page.path.split('/').at(1),
    isActivePage: pathname === page.path,
    subPages: page.subPages?.map(subPage => ({
      ...subPage,
      isActive: pathname === subPage.path,
    })),
  }))

export const useNavigation = () => {
  const t = useTranslations('Navigation')
  const pathname = usePathname() as Route

  const dashboard = useMemo(
    () =>
      setActivePages(
        [
          {
            title: t('dashboard'),
            path: Route.Home,
            Icon: DashboardIcon,
          },
          {
            title: t('modules'),
            path: Route.Modules,
            Icon: BookOpenIcon,
            color: SemanticColor.Primary,
          },
          {
            title: t('certificates'),
            path: Route.Certificates,
            Icon: AwardIcon,
            color: SemanticColor.Secondary,
          },
          {
            title: t('docs'),
            path: Route.Docs,
            Icon: MessageCircleQuestionIcon,
            color: SemanticColor.Tertiary,
            subPages: [
              {
                title: t('docsIntro'),
                path: Route.DocsIntro,
              },
              {
                title: t('docsTutorials'),
                path: Route.DocsTutorials,
              },
              {
                title: t('docsFaq'),
                path: Route.DocsFaq,
              },
            ],
          },
          {
            title: t('admin'),
            path: Route.Admin,
            Icon: CogIcon,
          },
        ],
        pathname,
      ),
    [pathname, t],
  )

  const common: Page[] = setActivePages(
    [
      {
        title: t('settings'),
        path: Route.Settings,
        Icon: SettingsIcon,
      },
      {
        title: t('help'),
        path: Route.Help,
        Icon: HelpCircleIcon,
      },
    ],
    pathname,
  )

  const pages = useMemo(() => [...dashboard, ...common], [common, dashboard])
  const page = useMemo(() => pages.find(page => page.isActive), [pages])
  const subPage = useMemo(() => pages.flatMap(page => page.subPages).find(subPage => subPage?.isActive), [pages])

  const routes = useMemo(
    () => ({
      common,
      dashboard,
    }),
    [common, dashboard],
  )

  return {
    page,
    pathname,
    routes,
    subPage,
  }
}
