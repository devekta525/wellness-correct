'use client'

import React from 'react'
import { Heart, Star, Sparkles } from 'lucide-react'
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
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-300 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {showMessage && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  const renderDots = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
      {showMessage && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75`}></div>
      </div>
      {showMessage && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  const renderSkeleton = () => (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      {showMessage && (
        <div className="text-center pt-4">
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
            {message}
          </p>
        </div>
      )}
    </div>
  )

  const renderHeartbeat = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Heart className={`${sizeClasses[size]} text-red-500 animate-pulse`} />
        <div className="absolute inset-0 animate-ping">
          <Heart className={`${sizeClasses[size]} text-red-300 opacity-75`} />
        </div>
      </div>
      {showMessage && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  const renderStars = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 text-yellow-500 animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 animate-ping">
          <Sparkles className={`${sizeClasses[size]} text-yellow-300 opacity-50`} />
        </div>
      </div>
      {showMessage && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'skeleton':
        return renderSkeleton()
      case 'heartbeat':
        return renderHeartbeat()
      case 'stars':
        return renderStars()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {renderLoader()}
        
        {/* Background decoration for non-skeleton variants */}
        {variant !== 'skeleton' && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Loader