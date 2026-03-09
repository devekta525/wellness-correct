'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  BookOpen,
  BarChart2,
  Settings,
  X,
  Stethoscope,
} from 'lucide-react'
import Image from 'next/image'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const navItems = [
  { name: 'Dashboard', href: '/doctors', icon: LayoutDashboard },
  { name: 'Patients', href: '/doctors/patients', icon: Users },
  { name: 'Appointments', href: '/doctors/appointments', icon: UserCheck },
  { name: 'Prescriptions', href: '/doctors/prescriptions', icon: FileText },
  { name: 'Notes', href: '/doctors/notes', icon: BookOpen },
  { name: 'Reports', href: '/doctors/reports', icon: BarChart2 },
  { name: 'Settings', href: '/doctors/settings', icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/doctors') return pathname === '/doctors'
    return pathname.startsWith(href)
  }

  const handleLogout = () => router.push('/logout')

  /* ─── Sidebar inner content ─── */
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-slate-100 flex-shrink-0 ${isCollapsed && !mobile ? 'justify-center px-2' : 'px-4'}`}>
        {(!isCollapsed || mobile) ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              {/* Circular logo — matches screenshot */}
              <div className="w-9 h-9 rounded-full border-2 border-slate-200 bg-white overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <span className="text-white text-[10px] font-black tracking-tight">W|F</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">WellnessFuel</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Doctor Portal</p>
              </div>
            </div>
            {!mobile && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {mobile && (
              <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="text-white text-[10px] font-black">W</span>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed && !mobile ? item.name : undefined}
              className={`
                relative flex items-center rounded-lg transition-all duration-150 mb-0.5 group
                ${isCollapsed && !mobile ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5 gap-3'}
                ${active
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }
              `}
            >
              {active && !isCollapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
              )}
              <Icon className={`flex-shrink-0 w-[17px] h-[17px] ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {(!isCollapsed || mobile) && (
                <span className={`text-sm truncate ${active ? 'text-blue-700 font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
              )}
              {/* Tooltip for collapsed */}
              {isCollapsed && !mobile && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className={`px-2 py-3 border-t border-slate-100 flex-shrink-0`}>
        <button
          onClick={handleLogout}
          className={`
            flex items-center rounded-lg transition-all duration-150 group w-full
            text-red-500 hover:bg-red-50
            ${isCollapsed && !mobile ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5 gap-3'}
          `}
          title={isCollapsed && !mobile ? 'Logout' : undefined}
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0 text-red-500" />
          {(!isCollapsed || mobile) && <span className="text-sm font-medium text-red-500">Logout</span>}
          {isCollapsed && !mobile && (
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
        ${isCollapsed ? 'w-[60px]' : 'w-[170px]'}
      `}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out z-50 shadow-xl
        flex flex-col w-64 lg:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent mobile />
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
