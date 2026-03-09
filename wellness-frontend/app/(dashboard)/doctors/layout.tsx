'use client'

import React, { useState } from 'react'
import Header from "@/components/layouts/doctors/Header";
import Sidebar from "@/components/layouts/doctors/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] dashboard-root">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Header isCollapsed={isCollapsed} />
      <main className={`
        pt-16 transition-all duration-300 ease-in-out min-h-screen
        ${isCollapsed ? 'lg:ml-[60px]' : 'lg:ml-[170px]'}
        ml-0
      `}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
