'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
  Home,
  Bell,
  Search,
  Settings,
  LogOut,
  LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logout } from '@/lib/auth'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectUser } from '@/lib/redux/features/authSlice'

interface Breadcrumb {
  name: string
  href: string
  icon?: LucideIcon
}

interface HeaderProps {
  isCollapsed: boolean
}

const Header: React.FC<HeaderProps> = ({ isCollapsed }) => {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const currentUser = useAppSelector(selectUser)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Breadcrumb[] = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ]

    if (pathSegments.length > 1) {
      const currentPage = pathSegments[pathSegments.length - 1]
      const capitalizedPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
      breadcrumbs.push({
        name: capitalizedPage,
        href: `/${pathSegments.join('/')}`
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const displayName = mounted
    ? currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.firstName || 'Admin User'
    : 'Admin User'

  const displayEmail = mounted ? (currentUser?.email || 'admin@example.com') : 'admin@example.com'

  const initials = mounted
    ? currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
      : currentUser?.firstName?.charAt(0)?.toUpperCase() || 'A'
    : 'A'

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white border-b border-slate-200
      transition-all duration-300 ease-in-out z-30
      ${isCollapsed ? 'lg:left-[60px]' : 'lg:left-64'}
      left-0
    `}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">

        {/* Left: Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-sm min-w-0">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              )}
              <Link
                href={breadcrumb.href}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors min-w-0
                  ${index === breadcrumbs.length - 1
                    ? 'text-slate-900 font-semibold bg-slate-50'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                {breadcrumb.icon && <breadcrumb.icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{breadcrumb.name}</span>
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* Small screen spacer */}
        <div className="flex-1 md:hidden" />

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Search bar - desktop */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-9 pr-4 py-2 w-56 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="hidden sm:flex p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Settings className="w-4.5 h-4.5" />
          </Link>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 mx-1" />

          {/* User profile */}
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 border-2 border-white shadow-sm ring-2 ring-slate-100">
              <AvatarImage src={currentUser?.imageUrl || ''} />
              <AvatarFallback className="text-xs font-semibold bg-blue-50 text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[140px]">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 truncate max-w-[140px]">
                {displayEmail}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
