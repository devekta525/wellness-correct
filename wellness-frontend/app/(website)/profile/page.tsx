import React from 'react'
import Profile from './profile'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | Wellness Fuel',
  description: 'Profile | Wellness Fuel',
} 

export default function ProfilePage() {
  return (
    <Profile />
  )
}