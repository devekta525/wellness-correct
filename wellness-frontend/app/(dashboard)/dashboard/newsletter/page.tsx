'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Trash2, 
  Mail,
  Users,
  UserCheck,
  UserX,
  Loader2,
  Calendar,
  Download,
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
  fetchNewslettersData,
  setNewsletterFilters,
  selectNewslettersData,
  selectNewslettersLoading,
  selectNewslettersError,
  selectNewsletterFilters,
  createNewsletter,
  updateNewsletterStatus,
  deleteNewsletter,
  Newsletter
} from '@/lib/redux/features/newsletterSlice'

const statuses = ["All", "Subscribed", "Unsubscribed"]

const NewsletterPage = () => {
  const dispatch = useAppDispatch()
  const newsletters = useAppSelector(selectNewslettersData)
  const isLoading = useAppSelector(selectNewslettersLoading)
  const error = useAppSelector(selectNewslettersError)
  const filters = useAppSelector(selectNewsletterFilters)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [newEmail, setNewEmail] = useState('')

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchNewslettersData())
  }, [dispatch])

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    dispatch(setNewsletterFilters({ email: value }))
  }

  const handleStatusChange = (value: string) => {
    dispatch(setNewsletterFilters({ status: value === 'All' ? '' : value }))
  }

  const handleAddNewsletter = async () => {
    try {
      if (!newEmail.trim()) return

      const success = await dispatch(createNewsletter(newEmail.trim())) as unknown as boolean
      if (success) {
        setShowAddModal(false)
        setNewEmail('')
        dispatch(fetchNewslettersData())
      }
    } catch (error) {
      console.error('Error adding newsletter subscription:', error)
    }
  }

  const handleDeleteNewsletter = async () => {
    try {
      if (!selectedNewsletter) return
      
      const success = await dispatch(deleteNewsletter(selectedNewsletter._id)) as unknown as boolean
      if (success) {
        setShowDeleteModal(false)
        setSelectedNewsletter(null)
        dispatch(fetchNewslettersData())
      }
    } catch (error) {
      console.error('Error deleting newsletter subscription:', error)
    }
  }

  const handleToggleStatus = async (newsletterId: string, currentStatus: "Subscribed" | "Unsubscribed") => {
    try {
      await dispatch(updateNewsletterStatus(newsletterId))
      dispatch(fetchNewslettersData())
    } catch (error) {
      console.error('Error updating newsletter status:', error)
    }
  }

  const openDeleteModal = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter)
    setShowDeleteModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Status', 'Subscribed Date', 'Updated Date'],
      ...newsletters.map(newsletter => [
        newsletter.email,
        newsletter.status,
        formatDate(newsletter.createdAt),
        formatDate(newsletter.updatedAt)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading newsletter subscriptions" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Newsletter Subscribers</h1>
                <p className="text-muted-foreground">Manage newsletter subscriptions and subscriber data</p>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={exportToCSV} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export subscriber list to CSV</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Subscriber
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new newsletter subscriber</p>
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
                      <p className="text-sm text-muted-foreground">Total Subscribers</p>
                      <p className="text-2xl font-bold text-foreground">{newsletters.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                      <p className="text-2xl font-bold text-foreground">
                        {newsletters.filter(n => n.status === 'Subscribed').length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unsubscribed</p>
                      <p className="text-2xl font-bold text-foreground">
                        {newsletters.filter(n => n.status === 'Unsubscribed').length}
                      </p>
                    </div>
                    <UserX className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-foreground">
                        {newsletters.filter(n => {
                          const createdAt = new Date(n.createdAt)
                          const now = new Date()
                          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
                        }).length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
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
                      placeholder="Search by email..."
                      value={filters.email || ''}
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
              <Loader variant="skeleton" message="Loading newsletter subscriptions..." />
            ) : newsletters.length === 0 ? (
              <NoData 
                message="No newsletter subscriptions found"
                description="Get started by adding your first subscriber"
                icon={<Mail className="w-full h-full text-muted-foreground/60" />}
                action={{
                  label: "Add Subscriber",
                  onClick: () => setShowAddModal(true)
                }}
                size="lg"
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsletters.map(newsletter => (
                      <Card key={newsletter._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                <CardTitle className="text-sm font-medium truncate">
                                  {newsletter.email}
                                </CardTitle>
                              </div>
                              <Badge variant={newsletter.status === 'Subscribed' ? 'default' : 'secondary'}>
                                {newsletter.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subscribed</span>
                                <span className="font-medium">{formatDate(newsletter.createdAt)}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="font-medium">{formatDate(newsletter.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleToggleStatus(newsletter._id, newsletter.status)}
                                  variant="outline"
                                  className="flex-1 gap-2"
                                  size="sm"
                                >
                                  {newsletter.status === 'Subscribed' ? (
                                    <>
                                      <UserX className="w-4 h-4" />
                                      Unsubscribe
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4" />
                                      Subscribe
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Toggle subscription status</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openDeleteModal(newsletter)}
                                  variant="outline"
                                  className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  size="sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this subscription</p>
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
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Subscribed Date</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletters.map(newsletter => (
                          <TableRow key={newsletter._id}>
                            <TableCell className="font-medium">{newsletter.email}</TableCell>
                            <TableCell>
                              <Badge variant={newsletter.status === 'Subscribed' ? 'default' : 'secondary'}>
                                {newsletter.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(newsletter.createdAt)}</TableCell>
                            <TableCell>{formatDate(newsletter.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => handleToggleStatus(newsletter._id, newsletter.status)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      {newsletter.status === 'Subscribed' ? (
                                        <UserX className="w-4 h-4" />
                                      ) : (
                                        <UserCheck className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Toggle subscription status</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openDeleteModal(newsletter)}
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete subscription</p>
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

            {/* Add Subscriber Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Newsletter Subscriber</DialogTitle>
                  <DialogDescription>
                    Add a new email address to the newsletter subscription list.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="add-email" className="mb-2 block">Email Address</Label>
                    <Input
                      id="add-email"
                      type="email"
                      placeholder="Enter email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNewsletter} disabled={isLoading || !newEmail.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subscriber
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Newsletter Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove &quot;{selectedNewsletter?.email}&quot; from the newsletter subscription list? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteNewsletter} disabled={isLoading}>
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
export default dynamic(() => Promise.resolve(NewsletterPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
})