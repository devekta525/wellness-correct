'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import LOGO_URL from '../../../public/logo.jpeg';

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
  X,
  Image as ImageIcon,
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

  const navigationGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Users',
      items: [
        { name: 'All Users', href: '/dashboard/users', icon: Users },
        { name: 'Doctors', href: '/dashboard/doctors', icon: UserCheck },
        { name: 'Influencers', href: '/dashboard/influencers', icon: UserPlus },
        { name: 'Customers', href: '/dashboard/customers', icon: ShoppingBag },
      ]
    },
    {
      label: 'Content',
      items: [
        { name: 'Blogs', href: '/dashboard/blogs', icon: BookOpen },
        { name: 'Categories', href: '/dashboard/categories', icon: FolderKanban },
        { name: 'Products', href: '/dashboard/products', icon: Package },
        { name: 'Banners', href: '/dashboard/banners', icon: ImageIcon },
        { name: 'Popups', href: '/dashboard/popups', icon: MessageSquare },
      ]
    },
    {
      label: 'Commerce',
      items: [
        { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
        { name: 'Coupons', href: '/dashboard/coupons', icon: Ticket },
        { name: 'Reviews', href: '/dashboard/reviews', icon: ThumbsUp },
      ]
    },
    {
      label: 'Growth',
      items: [
        { name: 'Leads', href: '/dashboard/leads', icon: TrendingUp },
        { name: 'Newsletter', href: '/dashboard/newsletter', icon: Mail },
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    router.push('/logout')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className={`flex items-center h-16 border-b border-slate-100 flex-shrink-0 ${isCollapsed ? 'justify-center px-3' : 'px-5'}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Image
                  src={imageSrc || LOGO_URL}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">WellnessFuel</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Admin Console</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {/* Group Label */}
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {isCollapsed && <div className="h-2" />}

            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative flex items-center rounded-xl transition-all duration-150 group mb-0.5
                    ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5 gap-3'}
                    ${active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }
                  `}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                >
                  {/* Active indicator bar */}
                  {active && !isCollapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
                  )}
                  <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-4.5 h-4.5' : 'w-4 h-4'} ${active ? 'text-blue-600' : ''}`} />
                  {!isCollapsed && (
                    <span className={`text-sm font-medium truncate ${active ? 'text-blue-700 font-semibold' : ''}`}>
                      {item.name}
                    </span>
                  )}
                  {/* Collapsed Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t border-slate-100 flex-shrink-0`}>
        <button
          onClick={handleLogout}
          className={`
            flex items-center rounded-xl transition-all duration-150 group w-full
            text-slate-500 hover:bg-red-50 hover:text-red-600
            ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5 gap-3'}
          `}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out z-50 shadow-sm
        hidden lg:flex flex-col
        ${isCollapsed ? 'w-[60px]' : 'w-64'}
      `}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out z-50 shadow-xl
        flex flex-col w-72 lg:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 border-b border-slate-100 flex-shrink-0 px-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Image src={imageSrc || LOGO_URL} alt="Logo" width={32} height={32} className="object-contain rounded-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">WellnessFuel</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Admin Console</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</p>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center rounded-xl transition-all duration-150 px-3 py-2.5 gap-3 mb-0.5 ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : ''}`} />
                      <span className={`text-sm font-medium truncate ${active ? 'text-blue-700 font-semibold' : ''}`}>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-slate-100 flex-shrink-0">
            <button onClick={handleLogout} className="flex items-center rounded-xl transition-all duration-150 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 px-3 py-2.5 gap-3">
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-xl lg:hidden shadow-sm hover:bg-slate-50 transition-colors"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>
    </>
  )
}

export default Sidebar
