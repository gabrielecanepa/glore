import { type LucideProps } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface IconProps extends LucideProps {}

export type Icon = (props: IconProps) => React.JSX.Element

export const DashboardIconOne: Icon = ({ className, ...props }) => (
  <svg
    className={cn('lucide lucide-layout-dashboard stroke-current stroke-2', className)}
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect className="stroke-primary" fill="transparent" height="9" rx="1" width="7" x="3" y="3" />
    <rect className="stroke-tertiary" fill="transparent" height="5" rx="1" width="7" x="14" y="3" />
    <rect className="stroke-secondary" fill="transparent" height="9" rx="1" width="7" x="14" y="12" />
    <rect className="stroke-foreground" fill="transparent" height="5" rx="1" width="7" x="3" y="16" />
  </svg>
)

export const DashboardIcon: Icon = props => (
  <svg fill="none" height="39" viewBox="0 0 32 39" width="32" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      className="fill-primary"
      d="M17.8001 18.9999C18.3001 18.8999 18.7001 18.6999 19.0001 18.2999L26.0001 8.89995L28.0001 10.3999C28.4001 10.6999 29.0001 10.7999 29.4001 10.4999C29.9001 10.2999 30.2001 9.79994 30.2001 9.29994L30.5001 1.59995C30.5001 1.09995 30.3001 0.699945 29.9001 0.399945C29.5001 0.0999449 29.1001 0.0999441 28.6001 0.199944L21.4001 2.69994C20.9001 2.89994 20.6001 3.29994 20.5001 3.79994C20.4001 4.29994 20.6001 4.79995 21.0001 5.09995L23.0001 6.59995L17.1001 14.4999L11.2001 10.0999C10.8001 9.79995 10.3001 9.69994 9.80014 9.69994C9.30014 9.79994 8.90014 9.99995 8.60014 10.3999L0.400136 21.3999C-0.199864 22.1999 0.000135899 23.3999 0.800136 24.0999C1.10014 24.2999 1.50014 24.4999 1.90014 24.4999C2.50014 24.4999 3.10014 24.1999 3.40014 23.6999L10.4001 14.1999L16.3001 18.5999C16.8001 18.9999 17.3001 19.0999 17.8001 18.9999Z"
    />
    <path
      className="fill-secondary"
      d="M6.6001 28.2002H1.4001C0.700097 28.2002 0.100098 28.8002 0.100098 29.5002V36.9002C0.100098 37.6002 0.700097 38.2002 1.4001 38.2002H6.6001C7.3001 38.2002 7.9001 37.6002 7.9001 36.9002V29.5002C7.9001 28.8002 7.3001 28.2002 6.6001 28.2002Z"
    />
    <path
      className="fill-secondary-accent"
      d="M18.2998 23H13.0998C12.3998 23 11.7998 23.6 11.7998 24.3V36.9C11.7998 37.6 12.3998 38.2 13.0998 38.2H18.2998C18.9998 38.2 19.5998 37.6 19.5998 36.9V24.3C19.5998 23.6 19.0998 23 18.2998 23Z"
    />
    <path
      className="fill-tertiary"
      d="M30.1001 17.7998H24.9001C24.2001 17.7998 23.6001 18.3998 23.6001 19.0998V36.8998C23.6001 37.5998 24.2001 38.1998 24.9001 38.1998H30.1001C30.8001 38.1998 31.4001 37.5998 31.4001 36.8998V19.0998C31.4001 18.3998 30.8001 17.7998 30.1001 17.7998Z"
    />
  </svg>
)
