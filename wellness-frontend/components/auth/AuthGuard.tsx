'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/utils/auth'
import Loader from '@/components/common/dashboard/Loader'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(redirectTo)
    }
  }, [router, redirectTo])

  // Show loading while checking authentication
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader variant="spinner" message="Checking authentication..." />
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard
