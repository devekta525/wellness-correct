'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Wallet, Clock, Loader2, AlertCircle, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

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

const StatCard = ({
  label,
  value,
  icon: Icon,
  loading,
  error,
}: {
  label: string,
  value: string | number,
  icon: any,
  loading?: boolean,
  error?: string | null,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500 tracking-wide">{label}</p>

        {loading ? (
          <div className="h-8 flex items-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="h-8 flex items-center text-red-500 text-[10px] uppercase font-bold tracking-widest">
            <AlertCircle className="w-4 h-4 mr-2" />
            Error
          </div>
        ) : (
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        )}
      </div>
    </motion.div>
  )
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats: initialStats }) => {
  const [totalOrders, setTotalOrders] = useState<number>(initialStats.totalOrders)
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [avgOrderValue, setAvgOrderValue] = useState<number>(initialStats.averageOrderValue)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/v1`
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }

      setLoading(true)
      setError(null)

      try {
        const [countRes, amountRes, aovRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/orders/user/my-orders/count`, config),
          axios.get(`${apiUrl}/total-amount`, config),
          axios.get(`${apiUrl}/orders/avg-order-value`, config)
        ])

        if (countRes.status === 'fulfilled' && countRes.value.data.success) {
          setTotalOrders(countRes.value.data.totalOrders)
        }

        if (amountRes.status === 'fulfilled' && amountRes.value.data.success) {
          setTotalSpent(amountRes.value.data.totalSpent)
        }

        if (aovRes.status === 'fulfilled' && aovRes.value.data.success) {
          setAvgOrderValue(aovRes.value.data.avgOrderValue)
        }

      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Total Orders"
        value={totalOrders}
        icon={ShoppingBag}
        loading={loading}
        error={error}
      />

      <StatCard
        label="Total Spent"
        value={`₹${totalSpent.toLocaleString()}`}
        icon={Wallet}
        loading={loading}
      />

      <StatCard
        label="Avg Order Value"
        value={`₹${avgOrderValue.toLocaleString()}`}
        icon={TrendingUp}
        loading={loading}
      />

      <StatCard
        label="Last Order Date"
        value={initialStats.lastOrderDate || "Active"}
        icon={Clock}
      />
    </div>
  )
}

export default StatsCards
