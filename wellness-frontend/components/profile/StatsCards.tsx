'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, DollarSign, TrendingUp, Award, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface UserStats {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  favoriteCategory: string
  lastOrderDate: string
}

interface StatsCardsProps {
  stats: UserStats
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats: initialStats }) => {
  const [totalOrders, setTotalOrders] = useState<number>(initialStats.totalOrders)
  const [totalSpent, setTotalSpent] = useState<number>(initialStats.totalSpent)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [avgOrderValue, setAvgOrderValue] = useState<number>(initialStats.averageOrderValue)
  const [aovLoading, setAovLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/v1`
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      setLoading(true)
      setError(null)

      // Fetch both stats in parallel, handle each independently
      const [countRes, amountRes] = await Promise.allSettled([
        fetch(`${apiUrl}/orders/user/my-orders/count`, { headers }),
        fetch(`${apiUrl}/total-amount`, { headers })
      ])

      let hasError = false

      // Handle order count
      if (countRes.status === 'fulfilled') {
        if (countRes.value.ok) {
          try {
            const countData = await countRes.value.json()
            if (countData.success) setTotalOrders(countData.totalOrders)
          } catch {
            console.error('Failed to parse order count response')
            hasError = true
          }
        } else {
          console.error(`Order count endpoint failed: ${countRes.value.status} ${countRes.value.statusText} — URL: ${apiUrl}/orders/user/my-orders/count`)
          hasError = true
        }
      } else {
        console.error('Order count request failed (network error):', countRes.reason)
        hasError = true
      }

      // Handle total amount
      if (amountRes.status === 'fulfilled') {
        if (amountRes.value.ok) {
          try {
            const amountData = await amountRes.value.json()
            if (amountData.success) setTotalSpent(amountData.totalSpent)
          } catch {
            console.error('Failed to parse total amount response')
            hasError = true
          }
        } else {
          console.error(`Total amount endpoint failed: ${amountRes.value.status} ${amountRes.value.statusText} — URL: ${apiUrl}/total-amount`)
          hasError = true
        }
      } else {
        console.error('Total amount request failed (network error):', amountRes.reason)
        hasError = true
      }

      if (hasError) setError('Failed to load')
      setLoading(false)
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const fetchAvgOrderValue = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      if (!token) {
        setAovLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/v1/orders/avg-order-value`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setAvgOrderValue(data.avgOrderValue)
            setTotalOrders(data.orderCount)
            setTotalSpent(data.totalSpent)
          }
        }
      } catch (err) {
        console.error('Failed to fetch average order value', err)
      } finally {
        setAovLoading(false)
      }
    }

    fetchAvgOrderValue()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Orders</p>
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mt-1" />
              ) : error ? (
                <div className="flex items-center text-red-500 text-xs mt-2 font-medium">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              ) : (
                <p className="text-3xl font-bold text-blue-900">{totalOrders}</p>
              )}
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Spent</p>
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mt-1" />
              ) : error ? (
                <div className="flex items-center text-red-500 text-xs mt-2 font-medium">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              ) : (
                <p className="text-3xl font-bold text-green-900">₹{totalSpent.toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Order Value</p>
              {aovLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-purple-900">₹{avgOrderValue.toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Favorite Category</p>
              <p className="text-2xl font-bold text-orange-900">{initialStats.favoriteCategory}</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatsCards
