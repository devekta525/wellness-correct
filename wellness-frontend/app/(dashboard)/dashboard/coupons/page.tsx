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
  Clock
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Coupon</DialogTitle>
                  <DialogDescription>
                    Create a new discount coupon with all the necessary details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
                    <div>
                      <Label htmlFor="add-coupon-code" className="mb-2 block">Coupon Code</Label>
                      <Input
                        id="add-coupon-code"
                        type="text"
                        placeholder="e.g., SAVE20"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-type" className="mb-2 block">Discount Type</Label>
                      <Select value={newCoupon.type} onValueChange={(value: 'Percentage' | 'Fixed') => setNewCoupon({...newCoupon, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="Fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-value" className="mb-2 block">
                        {newCoupon.type === 'Percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                      </Label>
                      <Input
                        id="add-coupon-value"
                        type="number"
                        placeholder={newCoupon.type === 'Percentage' ? '20' : '100'}
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                      />
                    </div>
                    {newCoupon.type === 'Percentage' && (
                      <div>
                        <Label htmlFor="add-coupon-max-discount" className="mb-2 block">Maximum Discount (₹)</Label>
                        <Input
                          id="add-coupon-max-discount"
                          type="number"
                          placeholder="500"
                          value={newCoupon.maxDiscount}
                          onChange={(e) => setNewCoupon({...newCoupon, maxDiscount: parseInt(e.target.value)})}
                        />
                      </div>
                    )}
                  </div>

                  {/* Usage & Validity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Usage & Validity</h3>
                    <div>
                      <Label htmlFor="add-coupon-min-order" className="mb-2 block">Minimum Order Value (₹)</Label>
                      <Input
                        id="add-coupon-min-order"
                        type="number"
                        placeholder="1000"
                        value={newCoupon.minOrderValue}
                        onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-start-date" className="mb-2 block">Start Date</Label>
                      <Input
                        id="add-coupon-start-date"
                        type="date"
                        value={newCoupon.startDate}
                        onChange={(e) => setNewCoupon({...newCoupon, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-expiry-date" className="mb-2 block">Expiry Date</Label>
                      <Input
                        id="add-coupon-expiry-date"
                        type="date"
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-usage-limit" className="mb-2 block">Total Usage Limit</Label>
                      <Input
                        id="add-coupon-usage-limit"
                        type="number"
                        placeholder="100"
                        value={newCoupon.usageLimit}
                        onChange={(e) => setNewCoupon({...newCoupon, usageLimit: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-user-limit" className="mb-2 block">Per User Usage Limit</Label>
                      <Input
                        id="add-coupon-user-limit"
                        type="number"
                        placeholder="1"
                        value={newCoupon.userUsageLimit}
                        onChange={(e) => setNewCoupon({...newCoupon, userUsageLimit: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-coupon-status" className="mb-2 block">Status</Label>
                      <Select value={newCoupon.status} onValueChange={(value: 'Active' | 'Inactive') => setNewCoupon({...newCoupon, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCoupon} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Coupon'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Coupon Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Coupon</DialogTitle>
                  <DialogDescription>
                    Update the coupon details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
                    <div>
                      <Label htmlFor="edit-coupon-code" className="mb-2 block">Coupon Code</Label>
                      <Input
                        id="edit-coupon-code"
                        type="text"
                        placeholder="e.g., SAVE20"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-type" className="mb-2 block">Discount Type</Label>
                      <Select value={newCoupon.type} onValueChange={(value: 'Percentage' | 'Fixed') => setNewCoupon({...newCoupon, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="Fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-value" className="mb-2 block">
                        {newCoupon.type === 'Percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                      </Label>
                      <Input
                        id="edit-coupon-value"
                        type="number"
                        placeholder={newCoupon.type === 'Percentage' ? '20' : '100'}
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                      />
                    </div>
                    {newCoupon.type === 'Percentage' && (
                      <div>
                        <Label htmlFor="edit-coupon-max-discount" className="mb-2 block">Maximum Discount (₹)</Label>
                        <Input
                          id="edit-coupon-max-discount"
                          type="number"
                          placeholder="500"
                          value={newCoupon.maxDiscount}
                          onChange={(e) => setNewCoupon({...newCoupon, maxDiscount: parseInt(e.target.value)})}
                        />
                      </div>
                    )}
                  </div>

                  {/* Usage & Validity */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Usage & Validity</h3>
                    <div>
                      <Label htmlFor="edit-coupon-min-order" className="mb-2 block">Minimum Order Value (₹)</Label>
                      <Input
                        id="edit-coupon-min-order"
                        type="number"
                        placeholder="1000"
                        value={newCoupon.minOrderValue}
                        onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-start-date" className="mb-2 block">Start Date</Label>
                      <Input
                        id="edit-coupon-start-date"
                        type="date"
                        value={newCoupon.startDate}
                        onChange={(e) => setNewCoupon({...newCoupon, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-expiry-date" className="mb-2 block">Expiry Date</Label>
                      <Input
                        id="edit-coupon-expiry-date"
                        type="date"
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-usage-limit" className="mb-2 block">Total Usage Limit</Label>
                      <Input
                        id="edit-coupon-usage-limit"
                        type="number"
                        placeholder="100"
                        value={newCoupon.usageLimit}
                        onChange={(e) => setNewCoupon({...newCoupon, usageLimit: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-user-limit" className="mb-2 block">Per User Usage Limit</Label>
                      <Input
                        id="edit-coupon-user-limit"
                        type="number"
                        placeholder="1"
                        value={newCoupon.userUsageLimit}
                        onChange={(e) => setNewCoupon({...newCoupon, userUsageLimit: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-coupon-status" className="mb-2 block">Status</Label>
                      <Select value={newCoupon.status} onValueChange={(value: 'Active' | 'Inactive') => setNewCoupon({...newCoupon, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditCoupon} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Coupon'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Coupon</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete coupon &quot;{selectedCoupon?.code}&quot;? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteCoupon} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
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