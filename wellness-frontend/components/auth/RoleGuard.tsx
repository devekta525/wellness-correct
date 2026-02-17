'use client'

import React from 'react'
import { getUserRole } from '@/lib/utils/auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
  requireAll?: boolean // If true, user must have ALL roles, if false, user needs ANY role
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  requireAll = false
}) => {
  const userRole = getUserRole()

  if (!userRole) {
    return <>{fallback}</>
  }

  const hasAccess = requireAll
    ? allowedRoles.every(role => role === userRole) // User must have ALL roles
    : allowedRoles.includes(userRole) // User needs ANY role

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common roles
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard allowedRoles={['admin', 'super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const DoctorOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard allowedRoles={['doctor', 'admin', 'super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const InfluencerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard allowedRoles={['influencer', 'admin', 'super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const UserOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleGuard allowedRoles={['user', 'customer', 'admin', 'super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
)

// Utility function to check if user has specific role
export const hasRole = (role: string): boolean => {
  const userRole = getUserRole()
  return userRole === role
}

// Utility function to check if user has any of the specified roles
export const hasAnyRole = (roles: string[]): boolean => {
  const userRole = getUserRole()
  return roles.includes(userRole || '')
}

// Utility function to check if user has all of the specified roles
export const hasAllRoles = (roles: string[]): boolean => {
  const userRole = getUserRole()
  return roles.every(role => role === userRole)
}
