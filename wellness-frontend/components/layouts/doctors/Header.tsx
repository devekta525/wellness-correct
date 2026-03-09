'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Bell,
  Search,
  Settings,
  LogOut,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logout } from '@/lib/auth'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectUser } from '@/lib/redux/features/authSlice'

interface HeaderProps {
  isCollapsed: boolean
}

const Header: React.FC<HeaderProps> = ({ isCollapsed }) => {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const currentUser = useAppSelector(selectUser)

  React.useEffect(() => { setMounted(true) }, [])

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />
    if (theme === 'light') return <Sun className="w-4 h-4" />
    if (theme === 'dark') return <Moon className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  // Get current page name for breadcrumb
  const segments = pathname.split('/').filter(Boolean)
  const pageName = segments.length > 1
    ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)
    : 'Dashboard'

  const displayName = mounted
    ? currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.firstName || 'Doctor'
    : 'Doctor'

  const displayEmail = mounted ? (currentUser?.email || 'doctor@example.com') : 'doctor@example.com'

  const initials = mounted
    ? currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
      : currentUser?.firstName?.charAt(0)?.toUpperCase() || 'D'
    : 'D'

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white border-b border-slate-200
      transition-all duration-300 ease-in-out z-30
      ${isCollapsed ? 'lg:left-[60px]' : 'lg:left-[170px]'}
      left-0
    `}>
      <div className="flex items-center justify-between h-full px-4 lg:px-5 gap-3">

        {/* Left: Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm flex-shrink-0">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300">›</span>
          <span className="font-semibold text-slate-800">{pageName}</span>
        </nav>

        {/* Center: Search bar */}
        <div className="flex-1 max-w-xs hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Spacer on small screens */}
        <div className="flex-1 md:hidden" />

        {/* Right: Actions */}
        <div className="flex items-center gap-1">

          {/* Bell */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            title={mounted ? `Current: ${resolvedTheme}` : 'Toggle theme'}
          >
            {getThemeIcon()}
          </button>

          {/* Settings */}
          <Link
            href="/doctors/settings"
            className="hidden sm:flex p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Divider */}
          <div className="h-7 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-white shadow-sm ring-2 ring-slate-100">
              <AvatarImage src={currentUser?.imageUrl || ''} />
              <AvatarFallback className="text-xs font-bold bg-blue-50 text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 truncate max-w-[120px]">
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
