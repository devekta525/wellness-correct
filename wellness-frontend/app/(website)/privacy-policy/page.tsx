import PrivacyPolicy from './privacy-policy'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Wellness Fuel',
  description: 'Privacy Policy | Wellness Fuel',
}

export default function PrivacyPolicyPage() {
  return (
    <PrivacyPolicy />
  )
}