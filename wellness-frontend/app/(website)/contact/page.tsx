import Contact from './contact'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Wellness Fuel',
  description: 'Contact | Wellness Fuel',
}

export default function ContactPage() {
  return (
    <Contact />
  )
}