'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import img1 from '../../../public/logo.png'

import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  ShoppingCart,
  Package,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  BookOpen,
  FolderKanban,
  ShoppingBag,
  BarChart2,
  ThumbsUp,
  Ticket,
  MessageSquare,
  Mail,
} from 'lucide-react'
import Image from 'next/image'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  imageSrc?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, imageSrc }) => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouter()
  // All sidebar items now have unique icons
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Doctors', href: '/dashboard/doctors', icon: UserCheck },
    { name: 'Influencers', href: '/dashboard/influencers', icon: UserPlus },
    { name: 'Customers', href: '/dashboard/customers', icon: ShoppingBag },
    { name: 'Blogs', href: '/dashboard/blogs', icon: BookOpen },
    { name: 'Categories', href: '/dashboard/categories', icon: FolderKanban },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Coupons', href: '/dashboard/coupons', icon: Ticket },
      { name: 'Popups', href: '/dashboard/popups', icon: MessageSquare },
    { name: 'Leads', href: '/dashboard/leads', icon: TrendingUp },
    { name: 'Newsletter', href: '/dashboard/newsletter', icon: Mail },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Reviews', href: '/dashboard/reviews', icon: ThumbsUp },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    // Add logout logic here
    router.push('/logout')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-background border-r border-border 
        transition-all duration-300 ease-in-out z-50 shadow-lg flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center justify-center flex-1">
              <Image 
               src={imageSrc || img1} 
                alt="HealthCare" 
                width={100} 
                height={40} 
                className="object-contain" 
              />
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center flex-1">
              <Image 
                src={imageSrc || img1}
                alt="HealthCare" 
                width={32}
                height={32} 
                className="object-contain" 
              />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${active
                    ? 'bg-accent text-accent-foreground border-r-2 border-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-2.5 text-destructive 
              hover:bg-destructive/10 rounded-lg transition-colors group relative
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-background border border-border rounded-lg lg:hidden shadow-lg hover:bg-accent transition-colors"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>
    </>
  )
}

export default Sidebar