'use client'

import React from 'react'
import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-[#ea8f39] mb-4">404</div>
          <div className="w-32 h-1 bg-gradient-to-r from-[#bed16b] to-[#ea8f39] mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#bed16b] to-[#ea8f39] hover:from-[#a8c55a] hover:to-[#d67d2a] text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Home className="mr-2 w-5 h-5" />
              Go Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={goBack}
            className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Popular Pages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Home className="w-5 h-5 text-[#ea8f39]" />
              <span className="text-slate-700 dark:text-slate-300">Home</span>
            </Link>
            <Link href="/about" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Search className="w-5 h-5 text-[#ea8f39]" />
              <span className="text-slate-700 dark:text-slate-300">About Us</span>
            </Link>
            <Link href="/contact" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Search className="w-5 h-5 text-[#ea8f39]" />
              <span className="text-slate-700 dark:text-slate-300">Contact</span>
            </Link>
            <Link href="/products" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Search className="w-5 h-5 text-[#ea8f39]" />
              <span className="text-slate-700 dark:text-slate-300">Products</span>
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Still can&apos;t find what you&apos;re looking for?
          </p>
          <Link href="/contact">
            <Button variant="outline" className="border-[#ea8f39] text-[#ea8f39] hover:bg-[#ea8f39] hover:text-white">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
