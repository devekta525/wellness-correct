"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layouts/doctors/Header";
import Sidebar from "@/components/layouts/doctors/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {isMounted && (
        <>
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <Header isCollapsed={isCollapsed} />
        </>
      )}
      <main
        className={`
        pt-16 transition-all duration-300 ease-in-out min-h-screen
        ${isMounted && isCollapsed ? "lg:ml-16" : "lg:ml-64"}
        ml-0
      `}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
