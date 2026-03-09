'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Ticket,
  TrendingUp,
  Loader2,
  Users,
  Clock,
  Calendar,
  Percent,
  Banknote,
  ShieldCheck,
  AlertCircle,
  History,
  Activity,
  TrendingUp as Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import NoData from '@/components/common/dashboard/NoData'
import Loader from '@/components/common/dashboard/Loader'
import Error from '@/components/common/dashboard/Error'
import {
  fetchCouponsData,
  setFilters,
  selectCouponsData,
  selectCouponsLoading,
  selectCouponsError,
  selectCouponsFilters,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon
} from '@/lib/redux/features/couponSlice'

const statuses = ["All", "Active", "Inactive"]

const CouponsPage = () => {
  const dispatch = useAppDispatch()
  const coupons = useAppSelector(selectCouponsData)
  const isLoading = useAppSelector(selectCouponsLoading)
  const error = useAppSelector(selectCouponsError)
  const filters = useAppSelector(selectCouponsFilters)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'Percentage' as 'Percentage' | 'Fixed',
    value: '',
    maxDiscount: 0,
    minOrderValue: 0,
    startDate: '',
    expiryDate: '',
    usageLimit: 0,
    userUsageLimit: 0,
    applicableUsers: [] as string[],
    status: 'Active' as 'Active' | 'Inactive'
  })

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCouponsData())
  }, [dispatch])

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ name: value }))
  }

  const handleStatusChange = (value: string) => {
    dispatch(setFilters({ status: value === 'All' ? '' : value }))
  }

  const handleAddCoupon = async () => {
    try {
      const couponData = {
        code: newCoupon.code,
        type: newCoupon.type,
        value: newCoupon.value,
        maxDiscount: newCoupon.maxDiscount,
        minOrderValue: newCoupon.minOrderValue,
        startDate: newCoupon.startDate,
        expiryDate: newCoupon.expiryDate,
        usageLimit: newCoupon.usageLimit,
        userUsageLimit: newCoupon.userUsageLimit,
        applicableUsers: newCoupon.applicableUsers || [],
        status: newCoupon.status
      }

      const success = await dispatch(createCoupon(couponData)) as unknown as boolean
      if (success) {
        setShowAddModal(false)
        setNewCoupon({
          code: '',
          type: 'Percentage',
          value: '',
          maxDiscount: 0,
          minOrderValue: 0,
          startDate: '',
          expiryDate: '',
          usageLimit: 0,
          userUsageLimit: 0,
          applicableUsers: [],
          status: 'Active'
        })
        dispatch(fetchCouponsData())
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
    }
  }

  const handleEditCoupon = async () => {
    try {
      if (!selectedCoupon) return

      const couponData = {
        code: newCoupon.code,
        type: newCoupon.type,
        value: newCoupon.value,
        maxDiscount: newCoupon.maxDiscount,
        minOrderValue: newCoupon.minOrderValue,
        startDate: newCoupon.startDate,
        expiryDate: newCoupon.expiryDate,
        usageLimit: newCoupon.usageLimit,
        userUsageLimit: newCoupon.userUsageLimit,
        applicableUsers: newCoupon.applicableUsers || [],
        status: newCoupon.status
      }

      const success = await dispatch(updateCoupon(selectedCoupon._id!, couponData)) as unknown as boolean
      if (success) {
        setShowEditModal(false)
        setSelectedCoupon(null)
        dispatch(fetchCouponsData())
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
    }
  }

  const handleDeleteCoupon = async () => {
    try {
      if (!selectedCoupon) return

      const success = await dispatch(deleteCoupon(selectedCoupon._id!)) as unknown as boolean
      if (success) {
        setShowDeleteModal(false)
        setSelectedCoupon(null)
        dispatch(fetchCouponsData())
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
    }
  }

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setNewCoupon({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minOrderValue: coupon.minOrderValue,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      userUsageLimit: coupon.userUsageLimit,
      applicableUsers: coupon.applicableUsers || [],
      status: coupon.status
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setShowDeleteModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const getStatusColor = (coupon: Coupon) => {
    if (isExpired(coupon.expiryDate)) return 'destructive'
    if (coupon.status === 'Active') return 'default'
    return 'secondary'
  }

  const getStatusText = (coupon: Coupon) => {
    if (isExpired(coupon.expiryDate)) return 'Expired'
    return coupon.status
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading coupons" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
                <p className="text-muted-foreground">Manage discount coupons and promotional codes</p>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Coupon
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new discount coupon</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Coupons</p>
                      <p className="text-2xl font-bold text-foreground">{coupons.length}</p>
                    </div>
                    <Ticket className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Coupons</p>
                      <p className="text-2xl font-bold text-foreground">
                        {coupons.filter(c => c.status === 'Active' && !isExpired(c.expiryDate)).length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Expired Coupons</p>
                      <p className="text-2xl font-bold text-foreground">
                        {coupons.filter(c => isExpired(c.expiryDate)).length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Usage</p>
                      <p className="text-2xl font-bold text-foreground">
                        {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search coupons..."
                      value={filters.name || ''}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={filters.status || 'All'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border border-input rounded-lg overflow-hidden">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => setViewMode('grid')}
                          className="rounded-none"
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Grid view</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => setViewMode('list')}
                          className="rounded-none"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>List view</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            {isLoading ? (
              <Loader variant="skeleton" message="Loading coupons..." />
            ) : coupons.length === 0 ? (
              <NoData
                message="No coupons found"
                description="Get started by creating your first discount coupon"
                icon={<Ticket className="w-full h-full text-muted-foreground/60" />}
                action={{
                  label: "Add Coupon",
                  onClick: () => setShowAddModal(true)
                }}
                size="lg"
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {coupons.map(coupon => (
                      <Card key={coupon._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <CardTitle className="text-lg font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {coupon.code}
                              </CardTitle>
                              <Badge variant={getStatusColor(coupon)}>
                                {getStatusText(coupon)}
                              </Badge>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Discount</span>
                                <span className="font-bold text-lg">
                                  {coupon.type === 'Percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                </span>
                              </div>

                              {coupon.type === 'Percentage' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Max Discount</span>
                                  <span className="font-medium">₹{coupon.maxDiscount}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Min Order</span>
                                <span className="font-medium">₹{coupon.minOrderValue}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Usage</span>
                                <span className="font-medium">{coupon.usedCount}/{coupon.usageLimit}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Expires</span>
                                <span className="font-medium text-sm">{formatDate(coupon.expiryDate)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(coupon)}
                                  className="flex-1 gap-2"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit coupon details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openDeleteModal(coupon)}
                                  variant="outline"
                                  className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  size="sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this coupon</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Min Order</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map(coupon => (
                          <TableRow key={coupon._id}>
                            <TableCell>
                              <div className="font-mono font-bold text-primary">
                                {coupon.code}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {coupon.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {coupon.type === 'Percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                            </TableCell>
                            <TableCell>₹{coupon.minOrderValue}</TableCell>
                            <TableCell>{coupon.usedCount}/{coupon.usageLimit}</TableCell>
                            <TableCell>{formatDate(coupon.expiryDate)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(coupon)}>
                                {getStatusText(coupon)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openEditModal(coupon)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit coupon</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openDeleteModal(coupon)}
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete coupon</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </>
            )}

            {/* Add Coupon Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Ticket className="w-6 h-6 text-primary" />
                      </div>
                      Incentive Protocol Creation
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                      Initialize a new promotional instrument with specific redemption logic and temporal constraints.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[75vh]">
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Left Column: Core Configuration */}
                      <div className="space-y-12">
                        {/* Section 1: General Info */}
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                              <Ticket className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Promotional Identity</h3>
                          </div>
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label htmlFor="coupon-code" className="text-xs font-black text-slate-400 uppercase tracking-widest">Identifier Alias (Code)</Label>
                              <Input
                                id="coupon-code"
                                placeholder="e.g., WELNESS25"
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-mono text-lg uppercase tracking-wider font-bold"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Inception Date</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="date"
                                    className="h-12 pl-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                    value={newCoupon.startDate}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Termination Threshold</Label>
                                <div className="relative">
                                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="date"
                                    className="h-12 pl-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                    value={newCoupon.expiryDate}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Section 2: Discount Logic */}
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                              <Percent className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Discount Mechanics</h3>
                          </div>
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Valuation Model</Label>
                              <Select value={newCoupon.type} onValueChange={(val: 'Percentage' | 'Fixed') => setNewCoupon({ ...newCoupon, type: val })}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Percentage" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold">
                                      <Percent className="w-4 h-4 text-emerald-500" /> Relational (Percentage)
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Fixed" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold">
                                      <Banknote className="w-4 h-4 text-primary" /> Static (Fixed Amount)
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">{newCoupon.type === 'Percentage' ? 'Scale Factor (%)' : 'Scalar Value (₹)'}</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-black text-primary"
                                  placeholder="0"
                                  value={newCoupon.value}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Entry Barrier (Min ₹)</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  placeholder="0"
                                  value={newCoupon.minOrderValue}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            {newCoupon.type === 'Percentage' && (
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cap Ceiling (Max ₹)</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  placeholder="Unlimited"
                                  value={newCoupon.maxDiscount}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            )}
                          </div>
                        </section>
                      </div>

                      {/* Right Column: Limits & Status */}
                      <div className="space-y-12">
                        {/* Section 3: Usage Controls */}
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                              <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Redemption Velocity</h3>
                          </div>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Quota</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  placeholder="Total"
                                  value={newCoupon.usageLimit}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Identity Cap</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  placeholder="Per user"
                                  value={newCoupon.userUsageLimit}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, userUsageLimit: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Operational State</Label>
                              <Select value={newCoupon.status} onValueChange={(val: 'Active' | 'Inactive') => setNewCoupon({ ...newCoupon, status: val })}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Active" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                                      <ShieldCheck className="w-4 h-4" /> Live Deployment
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Inactive" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold text-slate-400">
                                      <AlertCircle className="w-4 h-4" /> System Halted
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </section>

                        {/* Performance Anticipation */}
                        <section className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Activity className="w-20 h-20 text-primary" />
                          </div>

                          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-black uppercase text-xs tracking-widest mb-6 relative z-10">
                            <Activity className="w-5 h-5 text-primary" />
                            Protocol Visualization
                          </div>
                          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-black text-primary tracking-tighter text-lg">{newCoupon.code || 'DRAFT_STATE'}</span>
                              <Badge variant={newCoupon.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase">{newCoupon.status}</Badge>
                            </div>
                            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                              {newCoupon.type === 'Percentage' ? `${newCoupon.value}%` : `₹${newCoupon.value}`} <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Reduction</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                              Active: {newCoupon.startDate || 'TBD'} — {newCoupon.expiryDate || 'PERPETUAL'}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Entry Barrier</p>
                              <p className="text-xs font-black">₹{newCoupon.minOrderValue}</p>
                            </div>
                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Global Quota</p>
                              <p className="text-xs font-black">{newCoupon.usageLimit || 'UNLIMITED'}</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 gap-3 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button variant="outline" className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800" onClick={() => setShowAddModal(false)} disabled={isLoading}>
                    Discard Draft
                  </Button>
                  <Button
                    onClick={handleAddCoupon}
                    disabled={isLoading}
                    className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ingesting...
                      </>
                    ) : (
                      'Authorize Protocol'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Coupon Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Edit className="w-6 h-6 text-primary" />
                      </div>
                      Incentive Calibration
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                      Refine promotional parameters, temporal windows, and usage constraints for optimized performance.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[75vh]">
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Left Column: Core Configuration */}
                      <div className="space-y-12">
                        {/* Section 1: General Info */}
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                              <Ticket className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Protocol Identity</h3>
                          </div>
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label htmlFor="edit-coupon-code" className="text-xs font-black text-slate-400 uppercase tracking-widest">Identifier Alias (Code)</Label>
                              <Input
                                id="edit-coupon-code"
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-mono text-lg uppercase tracking-wider font-bold"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Inception Date</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="date"
                                    className="h-12 pl-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                    value={newCoupon.startDate ? newCoupon.startDate.split('T')[0] : ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Termination Threshold</Label>
                                <div className="relative">
                                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="date"
                                    className="h-12 pl-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                    value={newCoupon.expiryDate ? newCoupon.expiryDate.split('T')[0] : ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Section 2: Discount Logic */}
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                              <Percent className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Discount Mechanics</h3>
                          </div>
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Valuation Model</Label>
                              <Select value={newCoupon.type} onValueChange={(val: 'Percentage' | 'Fixed') => setNewCoupon({ ...newCoupon, type: val })}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Percentage" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold">
                                      <Percent className="w-4 h-4 text-emerald-500" /> Relational (Percentage)
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Fixed" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold">
                                      <Banknote className="w-4 h-4 text-primary" /> Static (Fixed Amount)
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">{newCoupon.type === 'Percentage' ? 'Scale Factor (%)' : 'Scalar Value (₹)'}</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-black text-primary"
                                  value={newCoupon.value}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Entry Barrier (Min ₹)</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  value={newCoupon.minOrderValue}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            {newCoupon.type === 'Percentage' && (
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cap Ceiling (Max ₹)</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  value={newCoupon.maxDiscount}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            )}
                          </div>
                        </section>
                      </div>

                      {/* Right Column: Limits & Status */}
                      <div className="space-y-12">
                        {/* Section 3: Usage Controls */}
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                              <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Redemption Velocity</h3>
                          </div>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Quota</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  value={newCoupon.usageLimit}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Identity Cap</Label>
                                <Input
                                  type="number"
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                  value={newCoupon.userUsageLimit}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, userUsageLimit: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Operational State</Label>
                              <Select value={newCoupon.status} onValueChange={(val: 'Active' | 'Inactive') => setNewCoupon({ ...newCoupon, status: val })}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Active" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                                      <ShieldCheck className="w-4 h-4" /> Live Protocol
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Inactive" className="rounded-lg">
                                    <div className="flex items-center gap-2 font-bold text-slate-400">
                                      <AlertCircle className="w-4 h-4" /> Suspended
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </section>

                        {/* Cumulative Intelligence */}
                        <section className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-5">
                            <History className="w-20 h-20 text-primary" />
                          </div>

                          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-black uppercase text-xs tracking-widest mb-6 relative z-10">
                            <History className="w-5 h-5 text-primary" />
                            Protocol Performance
                          </div>
                          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase tracking-widest">
                              <span>Quota Utilization</span>
                              <span>{selectedCoupon?.usedCount || 0} / {newCoupon.usageLimit || '∞'}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                style={{ width: `${Math.min(((selectedCoupon?.usedCount || 0) / (newCoupon.usageLimit || 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-lg font-mono font-black text-primary tracking-tighter">{newCoupon.code}</span>
                              <Badge variant={getStatusColor(selectedCoupon!)} className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase">{getStatusText(selectedCoupon!)}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Initialized</p>
                              <p className="text-xs font-black">{new Date(selectedCoupon?.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Last Sync</p>
                              <p className="text-xs font-black">{new Date(selectedCoupon?.updatedAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 gap-3 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button variant="outline" className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800" onClick={() => setShowEditModal(false)} disabled={isLoading}>
                    Discard Revisions
                  </Button>
                  <Button
                    onClick={handleEditCoupon}
                    disabled={isLoading}
                    className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calibrating...
                      </>
                    ) : (
                      'Commit Updates'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-red-50/50 dark:bg-red-950/20 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight text-red-600 dark:text-red-400 flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Protocol Termination
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Irreversible erasure of incentive vector from core system.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="p-8">
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed text-center">
                      Confirm irreversible termination of incentive node <span className="text-red-600 font-black px-2 bg-red-50 dark:bg-red-950/30 rounded-lg">&quot;{selectedCoupon?.code}&quot;</span>?
                    </p>
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button
                    variant="outline"
                    className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isLoading}
                  >
                    Abort Cycle
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteCoupon}
                    disabled={isLoading}
                    className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Terminating...
                      </>
                    ) : (
                      "Confirm Termination"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

// Export as dynamic component to prevent prerendering issues
export default dynamic(() => Promise.resolve(CouponsPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
})
