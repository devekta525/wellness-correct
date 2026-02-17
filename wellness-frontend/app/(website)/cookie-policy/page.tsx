import CookiePolicy from './cookie-policy'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Wellness Fuel',
  description: 'Cookie Policy | Wellness Fuel',
}

export default function CookiePolicyPage() {
  return (
    <CookiePolicy />
  )
}