'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronRight, 
  Home, 
  Sun, 
  Moon, 
  Bell, 
  Search,
  Settings,
  LucideIcon,
  Monitor,
  LogOut
} from 'lucide-react'
import { useTheme } from 'next-themes'
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
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const currentUser = useAppSelector(selectUser)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-5 h-5" />
    if (theme === 'light') return <Sun className="w-5 h-5" />
    if (theme === 'dark') return <Moon className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getThemeTitle = () => {
    if (!mounted) return 'Loading...'
    if (theme === 'light') return 'Switch to dark mode'
    if (theme === 'dark') return 'Switch to system mode'
    return 'Switch to light mode'
  }

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

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-background border-b border-border 
      transition-all duration-300 ease-in-out z-30 shadow-sm
      ${isCollapsed ? 'lg:left-16' : 'lg:left-64'}
      left-0
    `}>
      <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
        {/* Breadcrumbs - Hidden on small screens, visible on md and up */}
        <nav className="hidden md:flex items-center justify-start space-x-1 text-sm min-w-0">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
              <Link
                href={breadcrumb.href}
                className={`
                  flex items-center space-x-1 px-1 py-1 rounded-md transition-colors min-w-0
                  ${index === breadcrumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {breadcrumb.icon && <breadcrumb.icon className="w-3 h-3 flex-shrink-0" />}
                <span className="truncate">{breadcrumb.name}</span>
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* Empty div for small screens to maintain layout */}
        <div className="flex-1 md:hidden"></div>

        {/* Right side actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 bg-muted border border-input rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-destructive rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
            title={mounted ? `${getThemeTitle()} (Current: ${resolvedTheme})` : getThemeTitle()}
          >
            {getThemeIcon()}
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
              theme === 'light' ? 'bg-primary' : 
              theme === 'dark' ? 'bg-primary' : 
              'bg-primary'
            } animate-pulse`}></span>
          </button>

          {/* Settings - Hidden on mobile */}
          <button className="hidden sm:block p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-1 sm:space-x-2 pl-1 sm:pl-2 border-l border-border">
            <Avatar className="w-6 h-6 sm:w-7 sm:h-7">
              <AvatarImage src={currentUser?.imageUrl || "https://github.com/shadcn.png"} />
              <AvatarFallback className="text-xs">
                {mounted ? (
                  currentUser?.firstName && currentUser?.lastName 
                    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
                    : currentUser?.firstName?.charAt(0)?.toUpperCase() || 'U'
                ) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-foreground">
                {mounted ? (
                  currentUser?.firstName && currentUser?.lastName
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : currentUser?.firstName || 'User'
                ) : 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {mounted ? (currentUser?.email || 'user@example.com') : 'user@example.com'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
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