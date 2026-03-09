'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from "@/components/ui/skeleton"

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'heartbeat' | 'stars'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  showMessage?: boolean
  className?: string
}

const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  showMessage = true,
  className = ''
}) => {

  // For skeleton variant, render placeholder cards
  if (variant === 'skeleton') {
    return (
      <div className={cn("w-full space-y-6", className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-20 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-24 rounded-lg mb-1" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          ))}
        </div>

        {/* Table / Card skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full max-w-[200px] rounded-lg" />
                  <Skeleton className="h-3 w-full max-w-[140px] rounded-md" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
                <Skeleton className="h-8 w-20 rounded-xl flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {showMessage && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm font-medium animate-pulse">{message}</span>
          </div>
        )}
      </div>
    )
  }

  // Default spinner loader
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-4", className)}>
      <div className="relative">
        <div className="w-10 h-10 border-3 border-slate-200 rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-t-blue-600 rounded-full animate-spin" />
      </div>
      {showMessage && (
        <p className="text-sm text-slate-500 font-medium animate-pulse">{message}</p>
      )}
    </div>
  )
}

export default Loader
