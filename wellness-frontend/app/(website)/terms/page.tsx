import Terms from './terms'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms | Wellness Fuel',
  description: 'Terms | Wellness Fuel',
}

export default function TermsPage() {
  return (
    <Terms />
  )
}