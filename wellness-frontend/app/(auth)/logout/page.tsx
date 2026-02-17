"use client";
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeUserCookie } from '@/lib/auth'
import { Loader2, CheckCircle } from 'lucide-react'

const LogoutPage = () => {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  const [isLoggingOut, setIsLoggingOut] = useState(true)

  useEffect(() => {
    // Clear user cookie immediately
    removeUserCookie()
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsLoggingOut(false)
          clearInterval(timer)
          // Redirect to login after countdown
          setTimeout(() => {
            router.push('/')
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mb-8">
            {isLoggingOut ? (
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isLoggingOut ? 'Logging Out...' : 'Logged Out Successfully'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isLoggingOut 
              ? 'Please wait while we securely log you out' 
              : 'You have been successfully logged out'
            }
          </p>

          {isLoggingOut && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {!isLoggingOut && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LogoutPage